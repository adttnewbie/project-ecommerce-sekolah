<?php

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductFulfillmentType;
use App\Enums\ProductSalesMethod;
use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Sanction;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\User;
use App\Support\BuyerSanctionService;
use Illuminate\Support\Facades\DB;

test('seller with an active checkout ban is blocked from the buyer checkout flow', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    // Sanctions are enforced by user id, so a ban row for a seller blocks
    // their buyer-flow access even though issueSanction() is buyer-only.
    $ban = Sanction::query()->create([
        'user_id' => $seller->id,
        'type' => SanctionType::CheckoutBan->value,
        'reason' => 'Test ban',
        'issued_by' => $admin->id,
        'status' => SanctionStatus::Active->value,
        'starts_at' => now(),
        'ends_at' => now()->addDays(3),
    ]);

    expect(BuyerSanctionService::activeCheckoutBlocker($seller->fresh()))->not->toBeNull();

    $this->actingAs($seller)
        ->post(route('checkout'))
        ->assertRedirect(route('orders.index'))
        ->assertSessionHasErrors('sanction');

    $ban->update(['status' => SanctionStatus::Lifted->value, 'lifted_by' => $admin->id, 'lifted_at' => now()]);

    expect(BuyerSanctionService::activeCheckoutBlocker($seller->fresh()))->toBeNull();
});

test('seller with an active review ban is blocked from buyer reviews', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->approved()->create(['stock' => 5]);
    $order = Order::factory()->create(['user_id' => $seller->id]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'status' => OrderItemStatus::Completed,
    ]);

    Sanction::query()->create([
        'user_id' => $seller->id,
        'type' => SanctionType::ReviewBan->value,
        'reason' => 'Test review ban',
        'issued_by' => null,
        'status' => SanctionStatus::Active->value,
        'starts_at' => now(),
        'ends_at' => now()->addDays(3),
    ]);

    $this->actingAs($seller)
        ->from(route('catalog.show', $product))
        ->post(route('catalog.reviews.store', $product), [
            'rating' => 5,
            'comment' => 'Barangnya rapi dan sesuai deskripsi.',
        ])
        ->assertSessionHasErrors('sanction');
});

test('admin sanction store rejects an unknown sanction type', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($admin)
        ->post(route('admin.sanctions.store'), [
            'user_id' => $buyer->id,
            'type' => 'not-a-sanction',
        ])
        ->assertSessionHasErrors('type');

    $this->assertDatabaseMissing('sanctions', ['user_id' => $buyer->id]);
});

test('admin user store requires a role', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->from(route('admin.users.create-admin-jurusan'))
        ->post(route('admin.users.store'), [
            'name' => 'Tanpa Role',
            'email' => 'tanpa-role@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasErrors('role');

    $this->assertDatabaseMissing('users', ['email' => 'tanpa-role@example.com']);
});

test('duplicate product names resolve slug collisions', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $category = Category::factory()->create();

    $payload = [
        'name' => 'Pulpen Gel Hitam',
        'category_id' => $category->id,
        'description' => 'Pulpen gel hitam untuk catatan harian siswa.',
        'price' => 5000,
        'stock' => 12,
    ];

    $this->actingAs($seller)
        ->from(route('seller.products.create'))
        ->post(route('seller.products.store'), $payload)
        ->assertRedirect(route('seller.products.index'));

    $this->actingAs($seller)
        ->from(route('seller.products.create'))
        ->post(route('seller.products.store'), $payload)
        ->assertRedirect(route('seller.products.index'));

    $this->assertDatabaseHas('products', ['seller_id' => $seller->id, 'slug' => 'pulpen-gel-hitam']);
    $this->assertDatabaseHas('products', ['seller_id' => $seller->id, 'slug' => 'pulpen-gel-hitam-2']);
});

test('up jurusan products reject the pre-order combination', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $category = Category::factory()->create();
    $upJurusan = UpJurusan::factory()->create();

    $this->actingAs($seller)
        ->from(route('seller.products.create'))
        ->post(route('seller.products.store'), [
            'name' => 'Risol PO UP',
            'category_id' => $category->id,
            'description' => 'Risol diproduksi setelah pesanan terkumpul.',
            'price' => 3000,
            'sales_method' => ProductSalesMethod::UpJurusan->value,
            'fulfillment_type' => ProductFulfillmentType::PreOrder->value,
            'pre_order_estimate_days' => 3,
            'up_jurusan_id' => $upJurusan->id,
        ])
        ->assertSessionHasErrors('fulfillment_type');

    $this->assertDatabaseMissing('products', ['seller_id' => $seller->id, 'name' => 'Risol PO UP']);
});

test('seller order detail for another seller item returns 404 instead of 403', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $otherSeller = User::factory()->create(['role' => UserRole::Seller]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->for($otherSeller, 'seller')->approved()->create();
    $order = Order::factory()->create(['user_id' => $buyer->id]);
    $orderItem = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'status' => OrderItemStatus::Pending,
        'payment_status' => PaymentStatus::Paid,
    ]);

    $this->actingAs($seller);

    $this->get(route('seller.orders.show', $orderItem))->assertNotFound();

    $this->post(route('seller.orders.payment.approve', $orderItem))->assertNotFound();

    $this->post(route('seller.orders.payment.reject', $orderItem), [
        'payment_rejection_reason' => 'Ditolak.',
    ])->assertNotFound();

    // UpdateOrderItemStatusRequest::authorize() now aborts 404 on ownership
    // mismatch, consistent with the controller's scoped firstOrFail.
    $this->put(route('seller.orders.update-status', $orderItem), [
        'status' => OrderItemStatus::Packed->value,
    ])->assertNotFound();
});

test('seller offline movement detail for another seller returns 404 instead of 403', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $otherSeller = User::factory()->create(['role' => UserRole::Seller]);
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);
    $upJurusan = UpJurusan::factory()->create();
    $product = Product::factory()->for($otherSeller, 'seller')->approved()->create();
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $otherSeller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upJurusan->id,
    ]);

    $movementId = DB::table('up_jurusan_stock_movements')->insertGetId([
        'up_jurusan_consignment_id' => $consignment->id,
        'product_id' => null,
        'user_id' => $picket->id,
        'type' => 'out',
        'source' => 'pos_sale',
        'quantity' => 2,
        'unit_price' => 10000,
        'gross_amount' => 20000,
        'commission_amount' => 2000,
        'seller_amount' => 18000,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($seller)
        ->get(route('seller.orders.offline.show', $movementId))
        ->assertNotFound();
});

test('assign picket rejects non-picket users with a validation error', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($admin)
        ->from(route('admin-jurusan.up-jurusan.index'))
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $buyer->id,
        ])
        ->assertSessionHasErrors('picket_id');

    expect($buyer->fresh()->up_jurusan_id)->toBeNull();
});

test('assign picket rejects a picket scoped to another up jurusan', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $otherAdmin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $otherUpJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $otherAdmin->id]);
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $otherUpJurusan->id,
    ]);

    $this->actingAs($admin)
        ->from(route('admin-jurusan.up-jurusan.index'))
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $picket->id,
        ])
        ->assertSessionHasErrors('picket_id');

    expect($picket->fresh()->up_jurusan_id)->toBe($otherUpJurusan->id);
});
