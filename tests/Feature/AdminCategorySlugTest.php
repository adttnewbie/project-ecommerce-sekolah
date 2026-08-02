<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\User;

test('creating a category whose slug collides gets a suffixed slug', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    Category::query()->create(['name' => 'Alat Tulis', 'slug' => 'alat-tulis']);

    $this->actingAs($admin)
        ->from(route('admin.categories.index'))
        ->post(route('admin.categories.store'), ['name' => 'Alat-Tulis'])
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('categories', [
        'name' => 'Alat-Tulis',
        'slug' => 'alat-tulis-2',
    ]);
});

test('category creation retries when a concurrent request steals the slug', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    Category::query()->create(['name' => 'Alat Tulis', 'slug' => 'alat-tulis']);

    $injected = false;

    Category::creating(function () use (&$injected) {
        if ($injected) {
            return;
        }

        $injected = true;

        Category::forceCreate([
            'name' => 'Pesaing',
            'slug' => 'alat-tulis-2',
        ]);
    });

    try {
        $this->actingAs($admin)
            ->from(route('admin.categories.index'))
            ->post(route('admin.categories.store'), ['name' => 'Alat-Tulis'])
            ->assertRedirect(route('admin.categories.index'))
            ->assertSessionHasNoErrors();
    } finally {
        Category::flushEventListeners();
    }

    $this->assertDatabaseHas('categories', [
        'name' => 'Pesaing',
        'slug' => 'alat-tulis-2',
    ]);
    $this->assertDatabaseHas('categories', [
        'name' => 'Alat-Tulis',
        'slug' => 'alat-tulis-3',
    ]);
});

test('category update retries when a concurrent request steals the slug', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $category = Category::query()->create(['name' => 'Alat Tulis', 'slug' => 'alat-tulis']);

    $injected = false;

    Category::updating(function () use (&$injected) {
        if ($injected) {
            return;
        }

        $injected = true;

        Category::forceCreate([
            'name' => 'Pesaing Baru',
            'slug' => 'alat-tulisan',
        ]);
    });

    try {
        $this->actingAs($admin)
            ->from(route('admin.categories.index'))
            ->put(route('admin.categories.update', $category), ['name' => 'Alat Tulisan'])
            ->assertRedirect(route('admin.categories.index'))
            ->assertSessionHasNoErrors();
    } finally {
        Category::flushEventListeners();
    }

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'name' => 'Alat Tulisan',
        'slug' => 'alat-tulisan-2',
    ]);
});
