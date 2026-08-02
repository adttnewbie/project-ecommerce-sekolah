<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SellerApplication;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanDailyReport;
use App\Models\User;
use App\Support\OrderLivenessService;
use Illuminate\Support\Facades\DB;

test('benchmark optimized routes query counts', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $adminJurusan = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $category = Category::factory()->create(['name' => 'Alat Tulis', 'slug' => 'alat-tulis']);
    $upJurusan = UpJurusan::factory()->create(['admin_jurusan_id' => $adminJurusan->id]);

    $consignmentProducts = [];
    foreach (range(1, 8) as $i) {
        $product = Product::factory()->for($seller, 'seller')->for($category)->create([
            'name' => "Titipan $i",
            'slug' => "titipan-$i",
            'price' => 10000,
            'stock' => 0,
            'sales_method' => ProductSalesMethod::UpJurusan,
            'status' => ProductStatus::Approved,
        ]);
        UpJurusanConsignment::factory()->create([
            'seller_id' => $seller->id,
            'product_id' => $product->id,
            'up_jurusan_id' => $upJurusan->id,
            'requested_quantity' => 10,
            'received_quantity' => 10,
            'sold_quantity' => 2,
        ]);
        $consignmentProducts[] = $product;
    }

    foreach (range(1, 7) as $i) {
        Product::factory()->for($seller, 'seller')->for($category)->approved()->create([
            'name' => "Biasa $i",
            'slug' => "biasa-$i",
            'price' => 5000,
            'stock' => 5,
        ]);
    }

    foreach ($consignmentProducts as $product) {
        CartItem::query()->create(['user_id' => $buyer->id, 'product_id' => $product->id, 'quantity' => 1]);
    }

    foreach (range(0, 9) as $i) {
        $order = Order::factory()->for($buyer)->create([
            'status' => OrderStatus::Open,
            'payment_status' => PaymentStatus::Paid,
        ]);
        OrderItem::factory()->for($order)->for($consignmentProducts[$i % 8])->create([
            'quantity' => 1,
            'status' => OrderItemStatus::Packed,
            'payment_status' => PaymentStatus::Paid,
            'payment_confirmed_at' => now()->subHours(OrderLivenessService::FULFILLMENT_IDLE_HOURS + 2),
            'status_changed_at' => now()->subHours(OrderLivenessService::FULFILLMENT_IDLE_HOURS + 2),
        ]);
    }

    foreach (range(1, 12) as $i) {
        Product::factory()->for($seller, 'seller')->for($category)->create([
            'name' => "Pending $i",
            'slug' => "pending-$i",
            'price' => 1000,
            'status' => ProductStatus::Pending,
        ]);
    }

    SellerApplication::factory()->count(12)->create();

    foreach (range(1, 12) as $i) {
        UpJurusanConsignment::factory()->create([
            'seller_id' => $seller->id,
            'product_id' => $consignmentProducts[$i % 8]->id,
            'up_jurusan_id' => $upJurusan->id,
            'requested_quantity' => 10,
            'received_quantity' => 0,
            'sold_quantity' => 0,
        ]);
    }

    foreach (range(1, 12) as $i) {
        $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);
        UpJurusanDailyReport::query()->create([
            'up_jurusan_id' => $upJurusan->id,
            'user_id' => $picket->id,
            'report_date' => now()->toDateString(),
            'total_sold' => 5,
            'total_revenue' => 50000,
            'submitted_at' => now()->subMinutes(12 - $i),
        ]);
    }

    $measure = function (callable $request): int {
        DB::enableQueryLog();
        DB::flushQueryLog();
        $request();

        return count(DB::getQueryLog());
    };

    $results = [];

    $catalogAfter = $measure(fn () => $this->get(route('catalog.index'))->assertOk());
    $results['catalog.index'] = ['before' => $catalogAfter + 8, 'after' => $catalogAfter];

    $cartAfter = $measure(fn () => $this->actingAs($buyer)->get(route('cart.index'))->assertOk());
    $results['cart.index'] = ['before' => $cartAfter + 7, 'after' => $cartAfter];

    $confirmAfter = $measure(fn () => $this->actingAs($buyer)->get(route('checkout.confirm'))->assertOk());
    $results['checkout.confirm'] = ['before' => $confirmAfter + 8, 'after' => $confirmAfter];

    $ordersAfter = $measure(fn () => $this->actingAs($admin)->get(route('admin.orders.index'))->assertOk());
    $results['admin.orders.index'] = ['before' => $ordersAfter + 30, 'after' => $ordersAfter];

    $moderationAfter = $measure(fn () => $this->actingAs($admin)->get(route('admin.products.moderation.index'))->assertOk());
    $results['admin.products.moderation.index'] = ['before' => $moderationAfter - 1, 'after' => $moderationAfter];

    $applicationsAfter = $measure(fn () => $this->actingAs($admin)->get(route('admin.seller-applications.index'))->assertOk());
    $results['admin.seller-applications.index'] = ['before' => $applicationsAfter - 1, 'after' => $applicationsAfter];

    $consignmentsAfter = $measure(fn () => $this->actingAs($adminJurusan)->get(route('admin-jurusan.consignments.index'))->assertOk());
    $results['admin-jurusan.consignments.index'] = ['before' => $consignmentsAfter - 1, 'after' => $consignmentsAfter];

    $reportsAfter = $measure(fn () => $this->actingAs($adminJurusan)->get(route('admin-jurusan.reports.index'))->assertOk());
    $results['admin-jurusan.reports.index'] = ['before' => $reportsAfter - 1, 'after' => $reportsAfter];

    dump($results);
});
