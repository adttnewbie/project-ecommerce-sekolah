<?php

use App\Enums\UserRole;
use App\Models\User;

function pageProps(object $response): array
{
    $page = $response->viewData('page');

    return is_string($page)
        ? json_decode($page, true, flags: JSON_THROW_ON_ERROR)
        : $page;
}

test('shared auth payload is narrowed to the allow-list', function () {
    $user = User::factory()->create([
        'name' => 'Test Buyer',
        'email' => 'buyer@example.com',
        'role' => UserRole::Buyer,
    ]);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertOk();
    $authUser = pageProps($response)['props']['auth']['user'];

    expect($authUser)->toMatchArray([
        'id' => $user->id,
        'name' => 'Test Buyer',
        'email' => 'buyer@example.com',
        'phone' => null,
        'role' => 'buyer',
        'avatar' => null,
    ])->and(array_keys($authUser))->toBe(['id', 'name', 'email', 'phone', 'role', 'avatar']);
});

test('shared auth payload does not leak model attributes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('home'));

    $authUser = pageProps($response)['props']['auth']['user'];
    $pageJson = json_encode(pageProps($response));

    expect($authUser)->not->toHaveKey('password')
        ->and($authUser)->not->toHaveKey('two_factor_secret')
        ->and($authUser)->not->toHaveKey('two_factor_recovery_codes')
        ->and($authUser)->not->toHaveKey('remember_token')
        ->and($pageJson)->not->toContain($user->password);
});

test('shared auth payload is null for guests', function () {
    $response = $this->get(route('home'));

    $response->assertOk();

    expect(pageProps($response)['props']['auth']['user'])->toBeNull();
});
