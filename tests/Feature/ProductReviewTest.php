<?php

use App\Enums\OrderItemStatus;
use App\Enums\ProductStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function reviewSetup(): array
{
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create([
        'status' => ProductStatus::Approved,
        'price' => 15000,
        'stock' => 5,
    ]);
    $order = Order::factory()->create(['user_id' => $buyer->id]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'price' => 15000,
        'subtotal' => 15000,
        'status' => OrderItemStatus::Completed,
    ]);

    return [$buyer, $product];
}

test('buyer with a completed order item can submit a review once', function () {
    [$buyer, $product] = reviewSetup();

    $this->actingAs($buyer)
        ->from(route('catalog.show', $product))
        ->post(route('catalog.reviews.store', $product), [
            'rating' => 5,
            'comment' => 'Barangnya rapi dan sesuai deskripsi.',
        ])
        ->assertRedirect(route('catalog.show', $product))
        ->assertSessionHas(
            'success',
            'Ulasan berhasil dikirim dan menunggu moderasi. Terima kasih!',
        );

    expect(Review::query()
        ->where('product_id', $product->id)
        ->where('user_id', $buyer->id)
        ->where('rating', 5)
        ->exists())->toBeTrue();

    // Second attempt is blocked by the one-review-per-buyer rule.
    $this->actingAs($buyer)
        ->from(route('catalog.show', $product))
        ->post(route('catalog.reviews.store', $product), [
            'rating' => 4,
            'comment' => 'Coba lagi.',
        ])
        ->assertRedirect(route('catalog.show', $product))
        ->assertSessionHasErrors('review');

    expect(Review::query()
        ->where('product_id', $product->id)
        ->where('user_id', $buyer->id)
        ->count())->toBe(1);
});

test('buyer without a completed purchase cannot submit a review', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->create();

    OrderItem::factory()->create([
        'product_id' => $product->id,
        'status' => OrderItemStatus::Pending,
    ]);

    $this->actingAs($buyer)
        ->from(route('catalog.show', $product))
        ->post(route('catalog.reviews.store', $product), [
            'rating' => 5,
        ])
        ->assertRedirect(route('catalog.show', $product))
        ->assertSessionHasErrors('review');

    expect(Review::query()->count())->toBe(0);
});

test('rating must be an integer between one and five', function () {
    [$buyer, $product] = reviewSetup();

    foreach ([0, 6, 'abc'] as $invalid) {
        $this->actingAs($buyer)
            ->from(route('catalog.show', $product))
            ->post(route('catalog.reviews.store', $product), [
                'rating' => $invalid,
            ])
            ->assertRedirect(route('catalog.show', $product))
            ->assertSessionHasErrors('rating');
    }

    expect(Review::query()->count())->toBe(0);
});

test('buyer can update their own review', function () {
    [$buyer, $product] = reviewSetup();

    Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 3,
        'comment' => 'Awalnya biasa.',
    ]);

    $this->actingAs($buyer)
        ->from(route('catalog.show', $product))
        ->put(route('catalog.reviews.update', $product), [
            'rating' => 5,
            'comment' => 'Makin lama makin suka.',
        ])
        ->assertRedirect(route('catalog.show', $product))
        ->assertSessionHas(
            'success',
            'Ulasan berhasil diperbarui dan menunggu moderasi.',
        );

    expect(Review::query()
        ->where('product_id', $product->id)
        ->where('user_id', $buyer->id)
        ->count())->toBe(1);

    $review = Review::query()
        ->where('product_id', $product->id)
        ->where('user_id', $buyer->id)
        ->first();

    expect($review->rating)->toBe(5)
        ->and($review->comment)->toBe('Makin lama makin suka.');
});

test('updating a nonexistent review returns not found', function () {
    [$buyer, $product] = reviewSetup();

    $this->actingAs($buyer)
        ->put(route('catalog.reviews.update', $product), [
            'rating' => 4,
        ])
        ->assertNotFound();
});

test('detail payload exposes reviews my review and eligibility flags', function () {
    [$buyer, $product] = reviewSetup();
    $otherBuyer = User::factory()->create(['role' => UserRole::Buyer]);

    Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $otherBuyer->id,
        'rating' => 4,
        'comment' => 'Bagus nih.',
        'status' => ReviewStatus::Approved,
    ]);

    // Before writing anything: eligible to review.
    $this->actingAs($buyer)
        ->get(route('catalog.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->where('product.can_review', true)
            ->where('product.has_purchased', true)
            ->where('product.my_review', null)
            ->has('product.reviews', 1)
            ->where('product.reviews.0.user_name', $otherBuyer->name)
            ->where('product.reviews.0.rating', 4));

    Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 2,
        'comment' => null,
    ]);

    // After writing: no longer eligible, own review exposed but the public
    // list still only shows approved reviews (own new one is pending).
    $this->actingAs($buyer)
        ->get(route('catalog.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->where('product.can_review', false)
            ->where('product.my_review.rating', 2)
            ->has('product.reviews', 1));
});

test('guest detail payload carries no eligibility to review', function () {
    [, $product] = reviewSetup();

    $this->get(route('catalog.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->where('product.can_review', false)
            ->where('product.has_purchased', false)
            ->where('product.my_review', null));
});
