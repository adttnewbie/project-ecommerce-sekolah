<?php

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductFulfillmentType;
use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Events\DailyReportSubmitted;
use App\Events\OrderItemStatusChanged;
use App\Events\OrderPaymentApproved;
use App\Events\PendingOrderCreated;
use App\Events\ProductModerationDecided;
use App\Listeners\AdminOrderNotify;
use App\Listeners\CreatePendingOrderNotification;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanDailyReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function roleUser(UserRole $role): User
{
    return User::factory()->create(['role' => $role]);
}

function consignmentProduct(User $seller): array
{
    $product = Product::factory()->for($seller, 'seller')->approved()->create(['price' => 5000]);

    return [$product, UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'status' => UpJurusanConsignmentStatus::PendingApproval,
    ])];
}

it('notifies every admin on checkout instead of only the first one', function () {
    $firstAdmin = roleUser(UserRole::Admin);
    roleUser(UserRole::Admin);
    $secondAdmin = User::query()->where('role', UserRole::Admin->value)->orderByDesc('id')->first();

    $event = new PendingOrderCreated(
        orderId: 501,
        orderNumber: 'TRX-501',
        productId: 9001,
        productName: 'Produk Uji',
        sellerId: roleUser(UserRole::Seller)->id,
        buyerName: 'Budi',
        totalPrice: 25000,
        orderItemId: 17,
    );

    (new AdminOrderNotify)->handle($event);

    expect(Notification::query()->where('key', 'admin-order:501')->count())->toBe(2)
        ->and(Notification::query()->where('key', 'admin-order:501')->pluck('user_id'))
        ->toContain($firstAdmin->id)
        ->toContain($secondAdmin->id);
});

it('routes consignment notifications to the owning admin jurusan per transition', function () {
    $unrelatedAdmin = roleUser(UserRole::AdminJurusan);
    $owner = roleUser(UserRole::AdminJurusan);
    $up = UpJurusan::factory()->create(['admin_jurusan_id' => $owner->id]);
    $seller = roleUser(UserRole::Seller);
    [$product, $consignment] = consignmentProduct($seller);
    $consignment->update(['up_jurusan_id' => $up->id]);

    $dispatch = fn (string $status) => OrderItemStatusChanged::dispatch(
        orderItemId: null,
        orderId: null,
        productId: $product->id,
        consignmentId: $consignment->id,
        productName: $product->name,
        sellerName: $seller->name,
        buyerName: 'Admin Jurusan',
        action: "status {$status}",
        picketId: null,
        consignmentStatus: $status,
    );

    $dispatch('approved');

    expect(Notification::query()->where('user_id', $owner->id)->where('key', "admin-jurusan-consignment:{$consignment->id}:approved")->exists())->toBeTrue()
        ->and(Notification::query()->where('user_id', $unrelatedAdmin->id)->exists())->toBeFalse();

    // Same transition retried stays idempotent.
    $dispatch('approved');
    expect(Notification::query()->where('key', "admin-jurusan-consignment:{$consignment->id}:approved")->count())->toBe(1);

    // A different transition notifies again.
    $dispatch('rejected');
    expect(Notification::query()->where('key', "admin-jurusan-consignment:{$consignment->id}:rejected")->where('user_id', $owner->id)->exists())->toBeTrue();
});

it('sends the daily report to the owning admin jurusan only', function () {
    roleUser(UserRole::AdminJurusan);
    $owner = roleUser(UserRole::AdminJurusan);
    $up = UpJurusan::factory()->create(['admin_jurusan_id' => $owner->id]);

    $report = UpJurusanDailyReport::query()->create([
        'up_jurusan_id' => $up->id,
        'user_id' => roleUser(UserRole::PicketOfficer)->id,
        'report_date' => now()->toDateString(),
        'total_sold' => 3,
        'total_revenue' => 30000,
        'submitted_at' => now(),
    ]);

    DailyReportSubmitted::dispatch(
        reportId: $report->id,
        picketName: 'Picket A',
        totalRevenue: 30000,
    );

    expect(Notification::query()->where('key', "admin-jurusan-report:{$report->id}")->pluck('user_id')->all())->toBe([$owner->id]);
});

it('tells the seller when moderation approves or rejects their product', function () {
    $seller = roleUser(UserRole::Seller);

    ProductModerationDecided::dispatch(
        productId: 77,
        productName: 'Gantungan Kunci',
        sellerId: $seller->id,
        decision: 'approved',
    );

    ProductModerationDecided::dispatch(
        productId: 78,
        productName: 'Kalender Meja',
        sellerId: $seller->id,
        decision: 'rejected',
        reason: 'Foto buram',
    );

    $approved = Notification::query()->where('key', 'product-moderation:77:approved')->where('user_id', $seller->id)->sole();
    $rejected = Notification::query()->where('key', 'product-moderation:78:rejected')->sole();

    expect($approved->href)->toBe(route('seller.products.index', absolute: false))
        ->and($rejected->description)->toContain('Foto buram');

    // Role-accessible href: the seller can actually open it.
    $this->actingAs($seller)->get($approved->href)->assertOk();
});

it('notifies the seller when a picket settles payment and never the acting picket', function () {
    $seller = roleUser(UserRole::Seller);
    $picket = roleUser(UserRole::PicketOfficer);
    $buyer = roleUser(UserRole::Buyer);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $order = Order::factory()->for($buyer)->create();
    $item = OrderItem::factory()->for($order)->for($product)->create([
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Unpaid,
    ]);

    OrderPaymentApproved::dispatch(
        orderItemId: $item->id,
        orderNumber: 'TRX-1',
        amount: $item->subtotal,
        status: 'approved',
        processedBy: $picket->id,
    );

    expect(Notification::query()->where('key', "seller-payment-paid:{$item->id}")->where('user_id', $seller->id)->exists())->toBeTrue()
        ->and(Notification::query()->where('user_id', $picket->id)->exists())->toBeFalse();

    // Seller self-approval never notifies anyone about it.
    OrderPaymentApproved::dispatch(
        orderItemId: $item->id,
        orderNumber: 'TRX-1',
        amount: $item->subtotal,
        status: 'approved',
        processedBy: $seller->id,
    );

    expect(Notification::query()->where('key', "seller-payment-paid:{$item->id}")->count())->toBe(1);
});

it('fires low stock from the shared threshold once per product', function () {
    $seller = roleUser(UserRole::Seller);
    $product = Product::factory()->for($seller, 'seller')->approved()->create([
        'stock' => 7,
        'fulfillment_type' => ProductFulfillmentType::ReadyStock,
    ]);

    $product->update(['stock' => 5]);
    $product->dispatchLowStockNotificationIfReached();

    expect(Notification::query()->where('key', "seller-stock-low:{$product->id}")->where('user_id', $seller->id)->exists())->toBeTrue();

    $product->update(['stock' => 3]);
    $product->dispatchLowStockNotificationIfReached();

    expect(Notification::query()->where('key', "seller-stock-low:{$product->id}")->count())->toBe(1);
});

it('respects the in-app preference gate per user and type', function () {
    $seller = roleUser(UserRole::Seller);
    $otherSeller = roleUser(UserRole::Seller);

    NotificationPreference::create([
        'user_id' => $seller->id,
        'type' => 'order',
        'in_app_enabled' => false,
        'email_enabled' => false,
    ]);

    $event = new PendingOrderCreated(
        orderId: 601,
        orderNumber: 'TRX-601',
        productId: 9601,
        productName: 'Produk Uji',
        sellerId: $seller->id,
        buyerName: 'Budi',
        totalPrice: 10000,
        orderItemId: 61,
    );
    (new CreatePendingOrderNotification)->handle($event);

    expect(Notification::query()->where('user_id', $seller->id)->exists())->toBeFalse();

    // Other sellers with no preference row default to enabled.
    $eventOther = new PendingOrderCreated(
        orderId: 602,
        orderNumber: 'TRX-602',
        productId: 9602,
        productName: 'Produk Uji',
        sellerId: $otherSeller->id,
        buyerName: 'Budi',
        totalPrice: 10000,
        orderItemId: 62,
    );
    (new CreatePendingOrderNotification)->handle($eventOther);

    expect(Notification::query()->where('user_id', $otherSeller->id)->where('type', 'order')->exists())->toBeTrue();

    // Re-enabling restores delivery.
    NotificationPreference::query()
        ->where('user_id', $seller->id)
        ->where('type', 'order')
        ->update(['in_app_enabled' => true]);

    $eventAgain = new PendingOrderCreated(
        orderId: 603,
        orderNumber: 'TRX-603',
        productId: 9603,
        productName: 'Produk Uji',
        sellerId: $seller->id,
        buyerName: 'Budi',
        totalPrice: 10000,
        orderItemId: 63,
    );
    (new CreatePendingOrderNotification)->handle($eventAgain);

    expect(Notification::query()->where('user_id', $seller->id)->where('key', 'order-pending:603:'.$seller->id)->exists())->toBeTrue();
});
