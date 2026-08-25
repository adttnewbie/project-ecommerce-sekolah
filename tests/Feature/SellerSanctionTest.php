<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use App\Enums\SellerViolationType;
use App\Enums\UserRole;
use App\Events\SanctionIssued;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Sanction;
use App\Models\SellerViolation;
use App\Models\User;
use App\Support\OrderItemCancellation;
use App\Support\OrderLivenessService;
use App\Support\SanctionSettings;
use App\Support\SellerSanctionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia;

function sellerSweep(): int
{
    return OrderLivenessService::recordSellerSlaViolations();
}

it('records slow_fulfillment violation for paid items not shipped within SLA', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Packed,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now()->subHours(50),
    ]);

    $recorded = sellerSweep();

    expect($recorded)->toBe(1)
        ->and(SellerViolation::query()->where('user_id', $seller->id)->count())->toBe(1)
        ->and(SellerViolation::query()->first()->type)->toBe(SellerViolationType::SlowFulfillment);

    sellerSweep();

    expect(SellerViolation::query()->where('user_id', $seller->id)->count())->toBe(1);
});

it('does not punish sellers for picket-managed consignment items', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create([
        'sales_method' => ProductSalesMethod::UpJurusan,
        'stock' => 10,
    ]);
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now()->subDays(5),
    ]);

    expect(sellerSweep())->toBe(0)
        ->and(SellerViolation::query()->count())->toBe(0);
});

it('records pre_order_late violation when the deadline passes without shipping', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->approved()->preOrder()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'is_pre_order' => true,
        'pre_order_deadline' => now()->subDay(),
        'status' => OrderItemStatus::InProduction,
        'payment_status' => PaymentStatus::Paid,
        'status_changed_at' => now()->subHour(),
    ]);

    expect(sellerSweep())->toBe(1)
        ->and(SellerViolation::query()->first()->type)->toBe(SellerViolationType::PreOrderLate);
});

it('records unconfirmed_payment violation when a proof waits past the SLA', function () {
    SanctionSettings::updateSeller(['payment_confirm_sla_hours' => 48]);

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
    ]);
    $item = OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::PendingConfirmation,
    ]);
    DB::table('order_items')
        ->where('id', $item->id)
        ->update(['updated_at' => now()->subHours(49)]);

    expect(sellerSweep())->toBe(1)
        ->and(SellerViolation::query()->first()->type)->toBe(SellerViolationType::UnconfirmedPayment);
});

it('classifies seller cancels as excessive or production cancels', function () {
    SanctionSettings::updateSeller([
        'window_days' => 30,
        'warning_points' => 100,
        'payment_confirm_sla_hours' => 48,
    ]);

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();

    $plainOrder = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($plainOrder)->for($product)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderItemCancellation::cancelItem(
        $plainOrder->items->first(),
        $seller,
        'Stok habis',
    );

    $preOrderProduct = Product::factory()->for($seller, 'seller')->approved()->preOrder()->create();
    $preOrder = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($preOrder)->for($preOrderProduct)->create([
        'is_pre_order' => true,
        'status' => OrderItemStatus::InProduction,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderItemCancellation::cancelItem(
        $preOrder->items->first(),
        $seller,
        'Produksi gagal',
    );

    $types = SellerViolation::query()
        ->where('user_id', $seller->id)
        ->orderBy('id')
        ->pluck('type')
        ->map(fn (SellerViolationType $type) => $type->value);

    expect($types->toArray())->toBe([
        SellerViolationType::ExcessiveCancel->value,
        SellerViolationType::CancelAfterProduction->value,
    ])
        ->and(Sanction::query()->count())->toBe(0);
});

it('does not record seller violations for expiry, admin, or other-seller cancellations', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $otherSeller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    $expiryProduct = Product::factory()->for($seller, 'seller')->approved()->create();
    $expiryOrder = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($expiryOrder)->for($expiryProduct)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderLivenessService::expireUnpaidOrders($admin);
    expect(SellerViolation::query()->count())->toBe(0);

    $foreignProduct = Product::factory()->for($seller, 'seller')->approved()->create();
    $foreignOrder = Order::factory()->for($buyer)->create();
    $foreignItem = OrderItem::factory()->for($foreignOrder)->for($foreignProduct)->create([
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    expect(fn () => OrderItemCancellation::cancelItem($foreignItem, $otherSeller, 'Bukan punya saya'))
        ->toThrow(ValidationException::class);

    expect(SellerViolation::query()->count())->toBe(0);
});

it('records product_moderation_rejected with per-product dedup', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->create([
        'status' => ProductStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.products.moderation.reject', $product), ['reason' => 'Foto tidak sesuai'])
        ->assertRedirect();

    expect(Product::query()->find($product->id)->status)->toBe(ProductStatus::Rejected)
        ->and(SellerViolation::query()->where('user_id', $seller->id)->count())->toBe(1)
        ->and(SellerViolation::query()->first()->product_id)->toBe((int) $product->id)
        ->and(SellerViolation::query()->first()->type)->toBe(SellerViolationType::ProductModerationRejected);
});

it('issues one automatic warning when the points threshold is reached in the window', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();

    foreach (range(1, 3) as $i) {
        $order = Order::factory()->for($buyer)->create();
        $item = OrderItem::factory()->for($order)->for($product)->create();

        SellerSanctionService::recordViolation(
            (int) $seller->id,
            SellerViolationType::ExcessiveCancel,
            order: $item->order,
        );
    }

    $warnings = Sanction::query()
        ->where('user_id', $seller->id)
        ->where('type', SanctionType::Warning->value)
        ->get();

    expect($warnings)->toHaveCount(1)
        ->and($warnings[0]->issued_by)->toBeNull()
        ->and($warnings[0]->metadata['violation_points_window'])->toBe(3)
        ->and($warnings[0]->metadata['trigger'])->toBe('points_threshold');
});

it('does not duplicate the automatic warning inside the same window', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    foreach (range(1, 6) as $i) {
        SellerSanctionService::recordViolation(
            (int) $seller->id,
            SellerViolationType::ExcessiveCancel,
        );
    }

    expect(
        Sanction::query()->where('user_id', $seller->id)->where('type', SanctionType::Warning->value)->count()
    )->toBe(1)
        ->and(SellerViolation::query()->where('user_id', $seller->id)->count())->toBe(6);
});

it('rejects manual warnings, non-seller targets, buyer-only types, duplicates, and non-admin actors', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    expect(fn () => SellerSanctionService::issueSanction($seller, SanctionType::Warning, $admin))
        ->toThrow(ValidationException::class);
    expect(fn () => SellerSanctionService::issueSanction($buyer, SanctionType::ListingBan, $admin))
        ->toThrow(ValidationException::class);
    expect(fn () => SellerSanctionService::issueSanction($seller, SanctionType::CheckoutBan, $admin))
        ->toThrow(ValidationException::class);

    SellerSanctionService::issueSanction($seller, SanctionType::ListingBan, $admin);
    expect(fn () => SellerSanctionService::issueSanction($seller, SanctionType::ListingBan, $admin))
        ->toThrow(ValidationException::class);

    $sanction = SellerSanctionService::issueSanction($seller, SanctionType::SellingSuspension, $admin);
    expect(fn () => SellerSanctionService::lift($sanction, $seller))
        ->toThrow(ValidationException::class);
});

test('permanent ban ignores requested end date and dispatches notifications', function () {
    Event::fake();

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    $ban = SellerSanctionService::issueSanction(
        $seller,
        SanctionType::PermanentBan,
        $admin,
        reason: 'Pelanggaran berat',
        endsAt: now()->addDays(2),
    );

    expect($ban->ends_at)->toBeNull()
        ->and($ban->status)->toBe(SanctionStatus::Active);

    Event::assertDispatched(SanctionIssued::class);
});

it('blocks product listing under listing_ban and allows it again after lifting', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    $this->actingAs($seller)
        ->get(route('seller.products.create'))
        ->assertOk();

    $ban = SellerSanctionService::issueSanction($seller, SanctionType::ListingBan, $admin, endsAt: now()->addDays(3));

    $this->actingAs($seller)
        ->post(route('seller.products.store'))
        ->assertRedirect(route('seller.dashboard'))
        ->assertSessionHasErrors('sanction');

    SellerSanctionService::lift($ban, $admin);

    $this->actingAs($seller)
        ->post(route('seller.products.store'))
        ->assertRedirect()
        ->assertSessionMissing('sanction');
});

it('hides suspended seller products from the catalog and detail page', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $suspendedSeller = User::factory()->create(['role' => UserRole::Seller]);
    $activeSeller = User::factory()->create(['role' => UserRole::Seller]);

    $hidden = Product::factory()->for($suspendedSeller, 'seller')->approved()->create(['stock' => 5]);
    Product::factory()->for($activeSeller, 'seller')->approved()->create(['stock' => 5, 'name' => 'Produk Aktif']);

    SellerSanctionService::issueSanction($suspendedSeller, SanctionType::SellingSuspension, $admin);

    $this->get(route('catalog.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('catalog/index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Produk Aktif'));

    $this->get(route('catalog.show', $hidden))->assertNotFound();
});

it('ignores expired bans at enforcement time', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    Sanction::query()->create([
        'user_id' => $seller->id,
        'type' => SanctionType::ListingBan->value,
        'reason' => 'Old ban',
        'status' => SanctionStatus::Active->value,
        'starts_at' => now()->subDays(10),
        'ends_at' => now()->subDay(),
    ]);

    expect(SellerSanctionService::activeListingBlocker($seller))->toBeNull()
        ->and(SellerSanctionService::activeSellingBlocker($seller))->toBeNull()
        ->and(SellerSanctionService::suspendedSellerIds())->toBe([]);
});
