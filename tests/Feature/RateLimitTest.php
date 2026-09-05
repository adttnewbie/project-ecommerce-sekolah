<?php

use App\Models\Position;
use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\SchoolReferenceSeeder;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\RouteCollection;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

function registrationPayload(int $index): array
{
    $studentPosition = Position::query()->where('code', Position::STUDENT)->firstOrFail();
    $schoolClass = SchoolClass::query()->firstOrFail();

    return [
        'name' => "Registrant {$index}",
        'email' => "registrant{$index}@example.com",
        'phone' => '08123456789',
        'position_id' => $studentPosition->id,
        'class_id' => $schoolClass->id,
        'password' => 'password',
        'password_confirmation' => 'password',
    ];
}

it('allows three registrations per ip per minute and blocks the fourth', function () {
    $this->skipUnlessFortifyHas(Features::registration());
    $this->seed(SchoolReferenceSeeder::class);

    foreach (range(1, 3) as $index) {
        $this->post(route('register.store'), registrationPayload($index))
            ->assertRedirect();
    }

    expect(User::query()->where('email', 'like', 'registrant%')->count())->toBe(3);

    $this->from(route('register'))
        ->post(route('register.store'), registrationPayload(4))
        ->assertRedirect(route('register'))
        ->assertSessionHasErrors('email');

    $errors = session('errors')->all();
    expect($errors[0])->toContain('Terlalu banyak percobaan pendaftaran')
        ->and(User::query()->where('email', 'like', 'registrant%')->count())->toBe(3);
});

it('counts successful signups toward the ip limit instead of resetting it', function () {
    $this->skipUnlessFortifyHas(Features::registration());
    $this->seed(SchoolReferenceSeeder::class);

    $this->post(route('register.store'), registrationPayload(1))->assertRedirect();

    expect(RateLimiter::attempts('register|127.0.0.1'))->toBe(1);
});

it('throttles checkout at ten requests per user or ip per minute', function () {
    /** @var RouteCollection $routes */
    $routes = Route::getRoutes();
    $checkout = $routes->getByName('checkout');

    expect($checkout)->not->toBeNull()
        ->and($checkout->middleware())->toContain('throttle:checkout');

    $limits = RateLimiter::limiter('checkout')(request());
    $limits = is_iterable($limits) ? $limits : [$limits];

    /** @var Limit $limit */
    foreach ($limits as $limit) {
        expect($limit->maxAttempts)->toBe(10)
            ->and($limit->decaySeconds)->toBe(60);
    }
});
