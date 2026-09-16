<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('product image route redirects to r2 signed url when the file exists there', function () {
    Storage::fake('r2');
    Storage::fake('public');

    Storage::disk('r2')->put('products/r2-image.jpg', 'r2 content');

    $this->get(route('product-images.show', ['path' => 'products/r2-image.jpg']))
        ->assertRedirect();
});

test('product image route falls back to local public disk for legacy files', function () {
    Storage::fake('r2');
    Storage::fake('public');

    Storage::disk('public')->put('products/legacy-image.jpg', 'legacy content');

    $response = $this->get(route('product-images.show', ['path' => 'products/legacy-image.jpg']));

    $response->assertRedirect();
    expect($response->headers->get('Location'))->toContain('/storage/products/legacy-image.jpg');
});

test('product image route returns 404 when the file exists nowhere', function () {
    Storage::fake('r2');
    Storage::fake('public');

    $this->get(route('product-images.show', ['path' => 'products/missing.jpg']))
        ->assertNotFound();
});

test('product image route rejects paths outside the products prefix', function () {
    Storage::fake('r2');
    Storage::fake('public');

    Storage::disk('r2')->put('other/secret.jpg', 'secret');

    $this->get(route('product-images.show', ['path' => 'other/secret.jpg']))
        ->assertForbidden();
});

test('seller create stores the uploaded image on the r2 disk', function () {
    Storage::fake('r2');

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $category = Category::factory()->create();

    $this->actingAs($seller)
        ->from(route('seller.products.create'))
        ->post(route('seller.products.store'), [
            'name' => 'Pulpen Gel R2',
            'category_id' => $category->id,
            'description' => 'Pulpen gel merah untuk catatan harian siswa.',
            'price' => 5000,
            'stock' => 12,
            'image' => UploadedFile::fake()->image('produk.jpg'),
        ])
        ->assertRedirect(route('seller.products.index'));

    $product = Product::query()->where('seller_id', $seller->id)->firstOrFail();

    expect($product->image)->not->toBeNull();
    Storage::disk('r2')->assertExists($product->image);
});
