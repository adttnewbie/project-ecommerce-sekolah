<?php

use App\Enums\BuyerViolationType;
use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReviewStatus;
use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use App\Enums\UserRole;
use App\Events\SanctionIssued;
use App\Models\BuyerViolation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Sanction;
use App\Models\User;
use App\Support\BuyerSanctionService;
use App\Support\OrderItemCancellation;
use App\Support\OrderLivenessService;
use App\Support\SanctionSettings;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\ValidationException;

it('records unpaid_expired violation when an order expires', function () {
    User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create(['stock' => 1]);
    $order = Order::factory()->for($buyer)->create([
        'expires_at' => now()->subHour(),
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'quantity' => 1,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderLivenessService::expireUnpaidOrders(User::query()->where('role', UserRole::Admin)->first());

    expect(BuyerViolation::query()->where('user_id', $buyer->id)->count())->toBe(1)
        ->and(BuyerViolation::query()->where('order_id', $order->id)->first()->type)
        ->toBe(BuyerViolationType::UnpaidExpired);
});

it('records a single violation per expired order even with multiple items', function () {
    User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $productA = Product::factory()->approved()->create(['stock' => 1]);
    $productB = Product::factory()->approved()->create(['stock' => 1]);
    $order = Order::factory()->for($buyer)->create([
        'expires_at' => now()->subHour(),
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderItem::factory()->for($order)->for($productA)->create([
        'quantity' => 1,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderItem::factory()->for($order)->for($productB)->create([
        'quantity' => 1,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderLivenessService::expireUnpaidOrders(User::query()->where('role', UserRole::Admin)->first());

    expect(BuyerViolation::query()->where('user_id', $buyer->id)->count())->toBe(1);
});

it('issues one automatic warning when the points threshold is reached in the window', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    foreach (range(1, 3) as $i) {
        $product = Product::factory()->for($seller, 'seller')->approved()->create(['stock' => 1]);
        $order = Order::factory()->for($buyer)->create(['total_price' => 10_000]);
        OrderItem::factory()->for($order)->for($product)->create([
            'quantity' => 1,
            'subtotal' => 10_000,
            'status' => OrderItemStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
        ]);

        BuyerSanctionService::recordViolation(
            (int) $buyer->id,
            BuyerViolationType::ExcessiveCancel,
            order: $order->fresh(),
        );
    }

    $warnings = Sanction::query()
        ->where('user_id', $buyer->id)
        ->where('type', SanctionType::Warning->value)
        ->get();

    expect($warnings)->toHaveCount(1)
        ->and($warnings[0]->issued_by)->toBeNull()
        ->and($warnings[0]->metadata['violation_points_window'])->toBe(3)
        ->and($warnings[0]->metadata['trigger'])->toBe('points_threshold');
});

it('does not duplicate the automatic warning inside the same window', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();

    foreach (range(1, 6) as $i) {
        $order = Order::factory()->for($buyer)->create();
        OrderItem::factory()->for($order)->for($product)->create();

        BuyerSanctionService::recordViolation(
            (int) $buyer->id,
            BuyerViolationType::ExcessiveCancel,
            order: $order->fresh(),
        );
    }

    expect(
        Sanction::query()->where('user_id', $buyer->id)->where('type', SanctionType::Warning->value)->count()
    )->toBe(1)
        ->and(BuyerViolation::query()->where('user_id', $buyer->id)->count())->toBe(6);
});

it('warns automatically after five admin force-completes', function () {
    SanctionSettings::update([
        'window_days' => 30,
        'warning_points' => 100,
        'receipt_force_complete_count' => 5,
    ]);

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();

    foreach (range(1, 5) as $i) {
        $order = Order::factory()->for($buyer)->create([
            'status' => OrderStatus::Open,
            'payment_status' => PaymentStatus::Paid,
        ]);
        OrderItem::factory()->for($order)->for($product)->create([
            'status' => OrderItemStatus::Sent,
            'payment_status' => PaymentStatus::Paid,
            'status_changed_at' => now()->subDays(5),
        ]);

        OrderLivenessService::forceComplete($order, $admin);
    }

    $warning = Sanction::query()->where('user_id', $buyer->id)->where('type', SanctionType::Warning->value)->first();

    expect($warning)->not->toBeNull()
        ->and($warning->metadata['receipt_violations_window'])->toBe(5)
        ->and($warning->metadata['trigger'])->toBe('receipt_threshold');
});

it('classifies buyer cancel as production cancel only when an item was in production', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();

    $plainOrder = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($plainOrder)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    $this->actingAs($buyer)->post(route('orders.cancel', $plainOrder));

    $preOrderProduct = Product::factory()->approved()->create();
    $preOrder = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($preOrder)->for($preOrderProduct)->create([
        'status' => OrderItemStatus::InProduction,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    $this->actingAs($buyer)->post(route('orders.cancel', $preOrder));

    $types = BuyerViolation::query()
        ->where('user_id', $buyer->id)
        ->orderBy('id')
        ->pluck('type')
        ->map(fn (BuyerViolationType $type) => $type->value);

    expect($types->toArray())->toBe([BuyerViolationType::ExcessiveCancel->value, BuyerViolationType::CancelInProduction->value]);
});

it('does not record violations for seller-initiated cancellations', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $order = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderItemCancellation::cancelOrder($order, $seller, 'Seller cancelled');

    expect(BuyerViolation::query()->where('user_id', $buyer->id)->count())->toBe(0);
});

it('records review_rejected violation on moderation rejection', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $review = Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 1,
        'status' => ReviewStatus::Pending,
        'comment' => 'Promo lain di sini!',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.reviews.reject', $review), ['reason' => 'Spam'])
        ->assertRedirect();

    $violation = BuyerViolation::query()->where('user_id', $buyer->id)->first();

    expect($violation->type)->toBe(BuyerViolationType::ReviewRejected)
        ->and($violation->review_id)->toBe((int) $review->id)
        ->and(Sanction::query()->where('user_id', $buyer->id)->exists())->toBeFalse();
});

it('blocks checkout for buyers with an active checkout ban and allows it after lifting', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($buyer)
        ->post(route('checkout'))
        ->assertRedirect();

    $ban = BuyerSanctionService::issueSanction(
        target: $buyer,
        type: SanctionType::CheckoutBan,
        actor: $admin,
        reason: 'Test ban',
        endsAt: now()->addDays(3),
    );

    $this->actingAs($buyer)
        ->post(route('checkout'))
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors('sanction');

    BuyerSanctionService::lift($ban, $admin);

    $this->actingAs($buyer)
        ->post(route('checkout'))
        ->assertRedirect();
});

it('ignores expired bans at enforcement time', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    Sanction::query()->create([
        'user_id' => $buyer->id,
        'type' => SanctionType::CheckoutBan->value,
        'reason' => 'Old ban',
        'status' => SanctionStatus::Active->value,
        'starts_at' => now()->subDays(10),
        'ends_at' => now()->subDay(),
    ]);

    expect(BuyerSanctionService::activeCheckoutBlocker($buyer))->toBeNull();
});

it('blocks reviews under a review ban but not under a checkout-only warning', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    BuyerSanctionService::issueSanction($buyer, SanctionType::ReviewBan, $admin);

    expect(BuyerSanctionService::activeReviewBlocker($buyer))->not->toBeNull()
        ->and(BuyerSanctionService::activeCheckoutBlocker($buyer))->toBeNull();
});

it('rejects manual warnings, non-buyer targets, duplicate active sanctions, and non-admin actors', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    expect(fn () => BuyerSanctionService::issueSanction($buyer, SanctionType::Warning, $admin))
        ->toThrow(ValidationException::class);
    expect(fn () => BuyerSanctionService::issueSanction($seller, SanctionType::CheckoutBan, $admin))
        ->toThrow(ValidationException::class);

    BuyerSanctionService::issueSanction($buyer, SanctionType::CheckoutBan, $admin);
    expect(fn () => BuyerSanctionService::issueSanction($buyer, SanctionType::CheckoutBan, $admin))
        ->toThrow(ValidationException::class);

    $sanction = BuyerSanctionService::issueSanction($buyer, SanctionType::ReviewBan, $admin);
    expect(fn () => BuyerSanctionService::lift($sanction, $seller))
        ->toThrow(ValidationException::class);
});

test('permanent ban ignores requested end date and dispatches notifications', function () {
    Event::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    $ban = BuyerSanctionService::issueSanction(
        $buyer,
        SanctionType::PermanentBan,
        $admin,
        reason: 'Pelanggaran berat',
        endsAt: now()->addDays(2),
    );

    expect($ban->ends_at)->toBeNull()
        ->and($ban->status)->toBe(SanctionStatus::Active);

    Event::assertDispatched(SanctionIssued::class);
});
