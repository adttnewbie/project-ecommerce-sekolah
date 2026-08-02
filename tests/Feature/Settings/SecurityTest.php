<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('security page is displayed', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);
    Features::passkeys([
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManagePasskeys', true)
            ->where('passkeys', [])
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', false),
        );
});

test('security page requires password confirmation when enabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('security.edit'));

    $response->assertRedirect(route('password.confirm'));
});

test('security page renders without two factor when feature is disabled', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    config(['fortify.features' => []]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManagePasskeys', false)
            ->where('passkeys', [])
            ->where('canManageTwoFactor', false)
            ->missing('twoFactorEnabled')
            ->missing('requiresConfirmation'),
        );
});

test('security page does not expose the raw passkey credential', function () {
    $this->skipUnlessFortifyHas(Features::passkeys());

    Features::passkeys([
        'confirmPassword' => true,
    ]);

    $user = User::factory()->create();

    $user->passkeys()->create([
        'name' => 'Laptop Windows',
        'credential_id' => Str::random(16),
        'credential' => [
            'publicKey' => base64_encode('public-key-bytes'),
            'aaguid' => '08987058-cadc-4b81-b6e1-30de50dcbe96', // Windows Hello
            'signCount' => 1,
            'transports' => ['internal'],
        ],
    ]);

    $response = $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('settings/security')
        ->where('canManagePasskeys', true)
        ->has('passkeys', 1)
        ->where('passkeys.0.id', 1)
        ->where('passkeys.0.name', 'Laptop Windows')
        ->where('passkeys.0.authenticator', 'Windows Hello')
        ->where('passkeys.0.created_at_diff', fn (string $value) => str_contains($value, 'ago')),
    );

    $page = $response->viewData('page');
    $page = is_string($page)
        ? json_decode($page, true, flags: JSON_THROW_ON_ERROR)
        : $page;
    $passkey = $page['props']['passkeys'][0];

    expect($passkey)->toHaveKeys(['id', 'name', 'authenticator', 'created_at_diff', 'last_used_at_diff'])
        ->and($passkey)->not->toHaveKey('credential')
        ->and($passkey)->not->toHaveKey('credential_id')
        ->and(json_encode($page))->not->toContain('public-key-bytes');
});

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('security.edit'));
});
