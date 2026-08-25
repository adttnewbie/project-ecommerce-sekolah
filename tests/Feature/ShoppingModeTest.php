<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('seller enters shopping mode and lands on home', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    $this->actingAs($seller)
        ->post(route('shopping-mode.enter'))
        ->assertRedirect(route('home'));

    expect(session('shopping_mode'))->toBe('buyer');
});

test('seller leaves shopping mode and returns to seller dashboard', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    $this->actingAs($seller)
        ->post(route('shopping-mode.enter'))
        ->assertRedirect(route('home'));

    $this->post(route('shopping-mode.leave'))
        ->assertRedirect(route('seller.dashboard'));

    expect(session('shopping_mode'))->toBeNull();
});

test('shopping mode is shared with the inertia payload only while active', function () {
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    $this->actingAs($seller);

    $this->get(route('catalog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('shoppingMode', null));

    $this->post(route('shopping-mode.enter'))->assertRedirect();

    $this->get(route('catalog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('shoppingMode', 'buyer'));
});

test('non seller roles cannot toggle shopping mode', function (UserRole $role) {
    $user = User::factory()->create(['role' => $role]);

    $this->actingAs($user);

    $this->post(route('shopping-mode.enter'))->assertForbidden();
    $this->post(route('shopping-mode.leave'))->assertForbidden();
    expect(session('shopping_mode'))->toBeNull();
})->with([
    UserRole::Admin,
    UserRole::Buyer,
    UserRole::AdminJurusan,
    UserRole::PicketOfficer,
]);

test('guests are redirected to login from shopping mode endpoints', function () {
    $this->post(route('shopping-mode.enter'))->assertRedirect(route('login'));
    $this->post(route('shopping-mode.leave'))->assertRedirect(route('login'));
});
