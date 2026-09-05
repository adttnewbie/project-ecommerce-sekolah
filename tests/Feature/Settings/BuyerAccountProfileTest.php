<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('buyer gets account page with summary', function () {
    $user = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($user)->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/index')
            ->has('accountSummary', fn (Assert $s) => $s
                ->has('cart_count')
                ->has('wishlist_count')
                ->has('orders_total')
                ->has('orders_by_status')
            ));
});

test('non-buyer keeps settings page', function () {
    $user = User::factory()->create(['role' => UserRole::Seller]);

    $this->actingAs($user)->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile'));
});
