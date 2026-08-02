<?php

use App\Enums\ProductFulfillmentType;
use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\UpJurusan;

test('catalog index handles a product without any owner', function () {
    $category = Category::factory()->create();
    $orphan = Product::factory()->create([
        'seller_id' => null,
        'up_jurusan_id' => null,
        'category_id' => $category->id,
        'status' => ProductStatus::Approved,
        'fulfillment_type' => ProductFulfillmentType::ReadyStock,
        'sales_method' => ProductSalesMethod::SelfManaged,
        'stock' => 5,
    ]);

    $response = $this->get(route('catalog.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('catalog/index')
        ->has('products', 1)
        ->where('products.0.id', $orphan->id)
        ->where('products.0.owner.id', null)
        ->where('products.0.owner.name', null)
        ->where('products.0.owner.type', null)
        ->where('products.0.seller', null));
});

test('catalog detail handles a product without any owner', function () {
    $category = Category::factory()->create();
    $orphan = Product::factory()->create([
        'seller_id' => null,
        'up_jurusan_id' => null,
        'category_id' => $category->id,
        'status' => ProductStatus::Approved,
        'fulfillment_type' => ProductFulfillmentType::ReadyStock,
        'sales_method' => ProductSalesMethod::SelfManaged,
        'stock' => 5,
    ]);

    $response = $this->get(route('catalog.show', $orphan));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('catalog/show')
        ->where('product.id', $orphan->id)
        ->where('product.owner.id', null)
        ->where('product.owner.name', null)
        ->where('product.owner.type', null));
});

test('catalog index keeps the owner payload for seller and up_jurusan products', function () {
    $category = Category::factory()->create();
    $sellerProduct = Product::factory()->approved()->create([
        'category_id' => $category->id,
        'fulfillment_type' => ProductFulfillmentType::ReadyStock,
        'stock' => 5,
    ]);
    $upJurusan = UpJurusan::factory()->create();
    $upJurusanProduct = Product::factory()->approved()->create([
        'seller_id' => null,
        'up_jurusan_id' => $upJurusan->id,
        'category_id' => $category->id,
        'fulfillment_type' => ProductFulfillmentType::ReadyStock,
        'stock' => 5,
    ]);

    $response = $this->get(route('catalog.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('catalog/index')
        ->where('products.0.id', $sellerProduct->id)
        ->where('products.0.owner.id', $sellerProduct->seller_id)
        ->where('products.0.owner.name', $sellerProduct->seller->name)
        ->where('products.0.owner.type', 'seller')
        ->where('products.1.id', $upJurusanProduct->id)
        ->where('products.1.owner.id', $upJurusan->id)
        ->where('products.1.owner.name', $upJurusan->name)
        ->where('products.1.owner.type', 'up_jurusan'));
});
