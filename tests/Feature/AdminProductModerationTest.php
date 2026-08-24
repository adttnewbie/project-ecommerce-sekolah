<?php

use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DomainEvent;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can see pending products for moderation', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $category = Category::factory()->create(['name' => 'Alat Tulis', 'slug' => 'alat-tulis']);

    Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->create([
            'name' => 'Produk Pending',
            'slug' => 'produk-pending',
            'status' => ProductStatus::Pending,
        ]);

    Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->approved()
        ->create([
            'name' => 'Produk Approved',
            'slug' => 'produk-approved',
        ]);

    Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->create([
            'name' => 'Produk Rejected',
            'slug' => 'produk-rejected',
            'status' => ProductStatus::Rejected,
        ]);
    Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->create([
            'name' => 'Produk Titip UP',
            'slug' => 'produk-titip-up',
            'status' => ProductStatus::Pending,
            'sales_method' => ProductSalesMethod::UpJurusan,
        ]);

    $this->actingAs($admin);

    $response = $this->get(route('admin.products.moderation.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/moderation')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Produk Pending')
            ->where('products.data.0.category.name', 'Alat Tulis')
            ->where('products.data.0.seller.name', $seller->name),
        );
});

test('admin can approve a pending product and buyer catalog shows it', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $category = Category::factory()->create();
    $product = Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->create([
            'name' => 'Pulpen Gel Hitam',
            'slug' => 'pulpen-gel-hitam',
            'status' => ProductStatus::Pending,
            'stock' => 10,
            'rejection_reason' => 'Butuh foto lebih jelas',
        ]);

    Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->create([
            'name' => 'Produk Masih Pending',
            'slug' => 'produk-masih-pending',
            'status' => ProductStatus::Pending,
        ]);

    $this->actingAs($admin);

    $response = $this
        ->from(route('admin.products.moderation.index'))
        ->post(route('admin.products.moderation.approve', $product));

    $response->assertRedirect(route('admin.products.moderation.index'));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Approved->value,
        'rejection_reason' => null,
    ]);

    $this->actingAs($buyer);

    $catalogResponse = $this->get(route('catalog.index'));

    $catalogResponse
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/index')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Pulpen Gel Hitam')
            ->where('products.data.0.slug', 'pulpen-gel-hitam'),
        );
});

test('admin can reject a pending product with a required reason', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()
        ->for($seller, 'seller')
        ->create([
            'status' => ProductStatus::Pending,
        ]);

    $this->actingAs($admin);

    $response = $this
        ->from(route('admin.products.moderation.index'))
        ->post(route('admin.products.moderation.reject', $product), [
            'reason' => '  Foto produk belum jelas.  ',
        ]);

    $response->assertRedirect(route('admin.products.moderation.index'));

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Rejected->value,
        'rejection_reason' => 'Foto produk belum jelas.',
    ]);
});

test('rejecting a pending product without a reason fails', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()
        ->for($seller, 'seller')
        ->create(['status' => ProductStatus::Pending]);

    $this->actingAs($admin);

    foreach ([[], ['reason' => ''], ['reason' => '   ']] as $payload) {
        $this->post(route('admin.products.moderation.reject', $product), $payload)
            ->assertSessionHasErrors('reason');

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'status' => ProductStatus::Pending->value,
            'rejection_reason' => null,
        ]);
    }
});

test('rejecting a pending product with an overlong reason fails', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()
        ->for($seller, 'seller')
        ->create(['status' => ProductStatus::Pending]);

    $this->actingAs($admin);

    $this
        ->post(route('admin.products.moderation.reject', $product), [
            'reason' => str_repeat('a', 1001),
        ])
        ->assertSessionHasErrors('reason');

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Pending->value,
        'rejection_reason' => null,
    ]);
});

test('approving a pending product creates a product_approved audit event', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()
        ->for($seller, 'seller')
        ->create([
            'status' => ProductStatus::Pending,
            'rejection_reason' => 'Butuh perbaikan',
        ]);

    $this->actingAs($admin);

    $this->post(route('admin.products.moderation.approve', $product))->assertRedirect();

    $this->assertDatabaseHas('domain_events', [
        'aggregate_type' => 'product',
        'aggregate_id' => $product->id,
        'event_type' => 'product_approved',
        'actor_id' => $admin->id,
    ]);

    $event = DomainEvent::query()
        ->where('aggregate_type', 'product')
        ->where('aggregate_id', $product->id)
        ->where('event_type', 'product_approved')
        ->firstOrFail();

    expect($event->metadata)->toBe(['to_status' => ProductStatus::Approved->value]);
});

test('rejecting a pending product creates a product_rejected audit event with reason', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()
        ->for($seller, 'seller')
        ->create([
            'status' => ProductStatus::Pending,
        ]);

    $this->actingAs($admin);

    $this
        ->post(route('admin.products.moderation.reject', $product), ['reason' => 'Gambar tidak jelas.'])
        ->assertRedirect();

    $this->assertDatabaseHas('domain_events', [
        'aggregate_type' => 'product',
        'aggregate_id' => $product->id,
        'event_type' => 'product_rejected',
        'actor_id' => $admin->id,
    ]);

    $event = DomainEvent::query()
        ->where('aggregate_type', 'product')
        ->where('aggregate_id', $product->id)
        ->where('event_type', 'product_rejected')
        ->firstOrFail();

    expect($event->metadata)->toBe([
        'to_status' => ProductStatus::Rejected->value,
        'reason' => 'Gambar tidak jelas.',
    ]);
});

test('failed moderation does not create a fake audit event', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Approved,
    ]);

    $this->actingAs($admin);

    $this->post(route('admin.products.moderation.approve', $product))->assertNotFound();

    expect(
        DomainEvent::query()
            ->where('aggregate_type', 'product')
            ->where('aggregate_id', $product->id)
            ->count(),
    )->toBe(0);
});

test('approving an already approved product fails and leaves it untouched', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Approved,
        'rejection_reason' => null,
    ]);

    $this->actingAs($admin);

    $this->post(route('admin.products.moderation.approve', $product))->assertNotFound();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Approved->value,
        'rejection_reason' => null,
    ]);
});

test('approving a rejected product fails and leaves it untouched', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Rejected,
        'rejection_reason' => 'Butuh perbaikan',
    ]);

    $this->actingAs($admin);

    $this->post(route('admin.products.moderation.approve', $product))->assertNotFound();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Rejected->value,
        'rejection_reason' => 'Butuh perbaikan',
    ]);
});

test('rejecting an already rejected product fails and leaves it untouched', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Rejected,
        'rejection_reason' => 'Alasan awal',
    ]);

    $this->actingAs($admin);

    $this
        ->post(route('admin.products.moderation.reject', $product), ['reason' => 'Alasan baru'])
        ->assertNotFound();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Rejected->value,
        'rejection_reason' => 'Alasan awal',
    ]);
});

test('rejecting an approved product fails and leaves it untouched', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Approved,
        'rejection_reason' => null,
    ]);

    $this->actingAs($admin);

    $this
        ->post(route('admin.products.moderation.reject', $product), ['reason' => 'Alasan baru'])
        ->assertNotFound();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'status' => ProductStatus::Approved->value,
        'rejection_reason' => null,
    ]);
});

test('every pending self-managed product is seller-owned (moderation invariant)', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $category = Category::factory()->create();

    $this->actingAs($seller);

    $this->post(route('seller.products.store'), [
        'name' => 'Produk Baru Pending',
        'category_id' => $category->id,
        'description' => 'Deskripsi produk baru yang cukup panjang untuk validasi.',
        'price' => 10000,
        'sales_method' => ProductSalesMethod::SelfManaged->value,
        'fulfillment_type' => 'ready_stock',
        'stock' => 5,
        'status' => ProductStatus::Pending->value,
    ])->assertRedirect(route('seller.products.index'));

    expect(
        Product::query()
            ->where('status', ProductStatus::Pending)
            ->where('sales_method', ProductSalesMethod::SelfManaged)
            ->whereNull('seller_id')
            ->count(),
    )->toBe(0);
});

test('admin cannot moderate up jurusan consignment products', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Pending,
        'sales_method' => ProductSalesMethod::UpJurusan,
    ]);

    $this->actingAs($admin);

    $this->post(route('admin.products.moderation.approve', $product))->assertNotFound();
    $this
        ->post(route('admin.products.moderation.reject', $product), ['reason' => 'Alasan'])
        ->assertNotFound();
});

test('non admin users cannot access product moderation endpoints', function (UserRole $role) {
    $user = User::factory()->create(['role' => $role]);
    $product = Product::factory()->create([
        'status' => ProductStatus::Pending,
    ]);

    $this->actingAs($user);

    $this->get(route('admin.products.moderation.index'))->assertForbidden();
    $this->post(route('admin.products.moderation.approve', $product))->assertForbidden();
    $this->post(route('admin.products.moderation.reject', $product))->assertForbidden();
})->with([
    UserRole::Buyer,
    UserRole::Seller,
    UserRole::PicketOfficer,
]);
