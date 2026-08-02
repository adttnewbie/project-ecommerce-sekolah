<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanDailyReport;
use App\Models\UpJurusanDailyReportTransaction;
use App\Models\UpJurusanPayout;
use App\Models\UpJurusanPosSale;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use Illuminate\Database\QueryException;

test('a user with orders cannot be deleted', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create(['status' => OrderStatus::Completed]);
    OrderItem::factory()->for($order)->for($product)->create(['status' => OrderItemStatus::Completed]);

    expect(fn () => $buyer->delete())->toThrow(QueryException::class);

    expect(User::query()->whereKey($buyer->id)->exists())->toBeTrue()
        ->and(Order::query()->whereKey($order->id)->exists())->toBeTrue()
        ->and(OrderItem::query()->where('order_id', $order->id)->exists())->toBeTrue();
});

test('a user without financial history can still be deleted', function () {
    $user = User::factory()->create(['role' => UserRole::Buyer]);

    $user->delete();

    expect(User::query()->whereKey($user->id)->exists())->toBeFalse();
});

test('an up jurusan with a consignment cannot be deleted', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create([
        'sales_method' => ProductSalesMethod::UpJurusan,
    ]);
    UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upJurusan->id,
    ]);

    expect(fn () => $upJurusan->delete())->toThrow(QueryException::class);

    expect(UpJurusan::query()->whereKey($upJurusan->id)->exists())->toBeTrue();
});

test('an up jurusan with a pos sale cannot be deleted', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    UpJurusanPosSale::query()->create([
        'up_jurusan_id' => $upJurusan->id,
        'user_id' => $picket->id,
        'code' => 'TRX-TEST-1',
        'total_quantity' => 2,
        'total_amount' => 10_000,
    ]);

    expect(fn () => $upJurusan->delete())->toThrow(QueryException::class);

    expect(UpJurusan::query()->whereKey($upJurusan->id)->exists())->toBeTrue();
});

test('an up jurusan with a daily report cannot be deleted', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    UpJurusanDailyReport::query()->create([
        'up_jurusan_id' => $upJurusan->id,
        'user_id' => $picket->id,
        'report_date' => '2026-08-01',
        'total_sold' => 2,
        'total_revenue' => 10_000,
        'submitted_at' => '2026-08-01 11:00:00',
    ]);

    expect(fn () => $upJurusan->delete())->toThrow(QueryException::class);

    expect(UpJurusan::query()->whereKey($upJurusan->id)->exists())->toBeTrue();
});

test('an idle up jurusan can still be deleted', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);

    $upJurusan->delete();

    expect(UpJurusan::query()->whereKey($upJurusan->id)->exists())->toBeFalse();
});

test('an order with items cannot be deleted', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();
    $order = Order::factory()->for($buyer)->create();
    OrderItem::factory()->for($order)->for($product)->create();

    expect(fn () => $order->delete())->toThrow(QueryException::class);

    expect(Order::query()->whereKey($order->id)->exists())->toBeTrue()
        ->and(OrderItem::query()->where('order_id', $order->id)->exists())->toBeTrue();
});

test('a consignment with a payout cannot be deleted', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    UpJurusanPayout::query()->create([
        'up_jurusan_consignment_id' => $consignment->id,
        'seller_id' => $seller->id,
        'user_id' => $admin->id,
        'amount' => 10_000,
    ]);

    expect(fn () => $consignment->delete())->toThrow(QueryException::class);

    expect(UpJurusanConsignment::query()->whereKey($consignment->id)->exists())->toBeTrue();
});

test('deleting a consignment keeps its stock movements as a nulled link', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    $movement = UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => $consignment->id,
        'product_id' => null,
        'order_id' => null,
        'user_id' => $admin->id,
        'type' => 'out',
        'quantity' => 2,
        'unit_price' => 5_000,
        'gross_amount' => 10_000,
        'commission_amount' => 1_000,
        'seller_amount' => 9_000,
    ]);

    $consignment->delete();

    $surviving = $movement->fresh();

    expect($surviving)->not->toBeNull()
        ->and($surviving->up_jurusan_consignment_id)->toBeNull()
        ->and($surviving->gross_amount)->toBe(10_000)
        ->and($surviving->seller_amount)->toBe(9_000);
});

test('deleting a pos sale keeps its stock movements as a nulled link', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    $sale = UpJurusanPosSale::query()->create([
        'up_jurusan_id' => $upJurusan->id,
        'user_id' => $picket->id,
        'code' => 'TRX-TEST-2',
        'total_quantity' => 1,
        'total_amount' => 5_000,
    ]);
    $movement = UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => null,
        'product_id' => null,
        'order_id' => null,
        'up_jurusan_pos_sale_id' => $sale->id,
        'user_id' => $picket->id,
        'type' => 'out',
        'quantity' => 1,
        'unit_price' => 5_000,
        'gross_amount' => 5_000,
        'commission_amount' => 500,
        'seller_amount' => 4_500,
    ]);

    $sale->delete();

    $surviving = $movement->fresh();

    expect($surviving)->not->toBeNull()
        ->and($surviving->up_jurusan_pos_sale_id)->toBeNull()
        ->and($surviving->gross_amount)->toBe(5_000);
});

test('a daily report with snapshot transactions cannot be deleted', function () {
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    $report = UpJurusanDailyReport::query()->create([
        'up_jurusan_id' => $upJurusan->id,
        'user_id' => $picket->id,
        'report_date' => '2026-08-01',
        'total_sold' => 2,
        'total_revenue' => 10_000,
        'submitted_at' => '2026-08-01 11:00:00',
    ]);
    UpJurusanDailyReportTransaction::query()->create([
        'up_jurusan_daily_report_id' => $report->id,
        'code' => 'TRX-TEST-3',
        'total_quantity' => 2,
        'total_amount' => 10_000,
    ]);

    expect(fn () => $report->delete())->toThrow(QueryException::class);

    expect(UpJurusanDailyReport::query()->whereKey($report->id)->exists())->toBeTrue();
});
