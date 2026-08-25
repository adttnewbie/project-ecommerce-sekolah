<?php

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\Wishlist;
use Inertia\Testing\AssertableInertia;

test('buyer can toggle a product into and out of their wishlist via json', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();

    $this->actingAs($buyer)
        ->postJson(route('wishlist.toggle', $product))
        ->assertOk()
        ->assertJson(['is_wishlisted' => true, 'message' => 'Ditambahkan ke wishlist.']);

    expect(Wishlist::query()
        ->where('user_id', $buyer->id)
        ->where('product_id', $product->id)
        ->exists())->toBeTrue();

    $this->actingAs($buyer)
        ->postJson(route('wishlist.toggle', $product))
        ->assertOk()
        ->assertJson(['is_wishlisted' => false, 'message' => 'Dihapus dari wishlist.']);

    expect(Wishlist::query()
        ->where('user_id', $buyer->id)
        ->where('product_id', $product->id)
        ->exists())->toBeFalse();
});

test('guests are redirected to login instead of toggling a wishlist', function () {
    $product = Product::factory()->approved()->create();

    // The route sits behind the auth middleware, so both plain and JSON
    // guest attempts are bounced to the login screen.
    $this->post(route('wishlist.toggle', $product))
        ->assertRedirect(route('login'));

    expect(Wishlist::query()->count())->toBe(0);
});

test('catalog payload exposes wishlist state review summary sold count and discount price', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()
        ->for($seller, 'seller')
        ->approved()
        ->create([
            'price' => 20000,
            'original_price' => 40000,
            'stock' => 5,
        ]);

    Review::query()->create([
        'product_id' => $product->id,
        'user_id' => User::factory()->create(['role' => UserRole::Buyer])->id,
        'rating' => 5,
        'comment' => 'Mantap.',
    ]);
    Wishlist::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
    ]);

    $order = Order::factory()->create([
        'user_id' => $buyer->id,
        'payment_status' => PaymentStatus::Paid,
    ]);
    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 3,
        'status' => OrderItemStatus::Completed,
    ]);

    $this->actingAs($buyer)
        ->get(route('catalog.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('catalog/index')
            ->where('products.data.0.id', $product->id)
            ->where('products.data.0.is_wishlisted', true)
            ->where('products.data.0.original_price', 40000)
            ->where('products.data.0.review_summary.average', 5)
            ->where('products.data.0.review_summary.count', 1)
            ->where('products.data.0.sold_count', 3)
            ->etc());
});
