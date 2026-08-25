<?php

use App\Enums\OrderItemStatus;
use App\Enums\ProductStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Models\Notification;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function moderationSetup(): array
{
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->approved()->create([
        'status' => ProductStatus::Approved,
        'name' => 'Tumbler Sekolah',
    ]);
    $order = Order::factory()->create(['user_id' => $buyer->id]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'status' => OrderItemStatus::Completed,
    ]);

    return [$buyer, $admin, $product];
}

test('new review enters pending and stays hidden until approved', function () {
    [$buyer, $admin, $product] = moderationSetup();

    $this->actingAs($buyer)
        ->from(route('catalog.show', $product))
        ->post(route('catalog.reviews.store', $product), [
            'rating' => 4,
            'comment' => 'Bagus banget.',
        ])
        ->assertRedirect(route('catalog.show', $product));

    $review = Review::query()
        ->where('product_id', $product->id)
        ->where('user_id', $buyer->id)
        ->first();

    expect($review->status)->toBe(ReviewStatus::Pending);

    // Public payload hides pending reviews and the summary stays empty.
    $this->get(route('catalog.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->where('product.review_summary', null)
            ->has('product.reviews', 0)
            ->where('product.my_review.status.code', 'pending'));

    // Admin receives a single queue ping.
    expect(Notification::query()
        ->where('key', "admin-review-pending:{$review->id}")
        ->count())->toBe(1);

    // Approve makes it public and notifies the buyer exactly once.
    $this->actingAs($admin)
        ->post(route('admin.reviews.approve', $review))
        ->assertRedirect();

    $review->refresh();
    expect($review->status)->toBe(ReviewStatus::Approved)
        ->and(Notification::query()
            ->where('user_id', $buyer->id)
            ->where('key', "review-moderation:{$review->id}:approved")
            ->count())->toBe(1);

    $this->get(route('catalog.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->where('product.review_summary.count', 1)
            ->where('product.review_summary.average', 4)
            ->has('product.reviews', 1)
            ->where('product.reviews.0.comment', 'Bagus banget.'));
});

test('rejected review stores reason hides content and notifies buyer', function () {
    [$buyer, $admin, $product] = moderationSetup();

    $review = Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 1,
        'status' => ReviewStatus::Pending,
        'comment' => 'Promo lain di sini!',
    ]);

    $this->actingAs($admin)
        ->from(route('admin.reviews.index'))
        ->post(route('admin.reviews.reject', $review), [
            'reason' => 'Mengandung promosi.',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $review->refresh();
    expect($review->status)->toBe(ReviewStatus::Rejected)
        ->and($review->rejection_reason)->toBe('Mengandung promosi.')
        ->and(Notification::query()
            ->where('user_id', $buyer->id)
            ->where('key', "review-moderation:{$review->id}:rejected")
            ->exists())->toBeTrue();

    $this->actingAs($buyer)
        ->get(route('catalog.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->has('product.reviews', 0)
            ->where('product.my_review.status.code', 'rejected')
            ->where('product.my_review.rejection_reason', 'Mengandung promosi.'));
});

test('rejecting requires a non empty reason', function () {
    [$buyer, $admin, $product] = moderationSetup();

    $review = Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 3,
        'status' => ReviewStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->from(route('admin.reviews.index'))
        ->post(route('admin.reviews.reject', $review), [
            'reason' => '   ',
        ])
        ->assertRedirect(route('admin.reviews.index'))
        ->assertSessionHasErrors('reason');

    expect($review->fresh()->status)->toBe(ReviewStatus::Pending);
});

test('editing a review resets it to pending and clears rejection data', function () {
    [$buyer, $admin, $product] = moderationSetup();

    $review = Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 2,
        'status' => ReviewStatus::Rejected,
        'rejection_reason' => 'Kasar.',
        'comment' => 'Jelek.',
    ]);

    $this->actingAs($buyer)
        ->put(route('catalog.reviews.update', $product), [
            'rating' => 5,
            'comment' => 'Sudah jauh lebih baik.',
        ])
        ->assertRedirect(route('catalog.show', $product));

    $review->refresh();
    expect($review->status)->toBe(ReviewStatus::Pending)
        ->and($review->rejection_reason)->toBeNull()
        ->and($review->rating)->toBe(5);
});

test('only admins may decide review moderation', function () {
    [$buyer, , $product] = moderationSetup();
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    $review = Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 5,
        'status' => ReviewStatus::Pending,
    ]);

    foreach ([$buyer, $seller] as $actor) {
        $this->actingAs($actor)
            ->post(route('admin.reviews.approve', $review))
            ->assertForbidden();

        $this->actingAs($actor)
            ->post(route('admin.reviews.reject', $review), ['reason' => 'x'])
            ->assertForbidden();
    }

    expect($review->fresh()->status)->toBe(ReviewStatus::Pending);
});

test('deciding a non pending review returns not found', function () {
    [$buyer, $admin, $product] = moderationSetup();

    $approved = Review::query()->create([
        'product_id' => $product->id,
        'user_id' => $buyer->id,
        'rating' => 5,
        'status' => ReviewStatus::Approved,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.reviews.approve', $approved))
        ->assertNotFound();

    $this->actingAs($admin)
        ->post(route('admin.reviews.reject', $approved), ['reason' => 'x'])
        ->assertNotFound();
});
