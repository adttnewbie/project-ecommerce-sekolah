<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

/**
 * Resolves the actor to attribute system-originated changes to.
 *
 * Prefers the first admin user so handoff/audit events point at a real human.
 * When no admin user exists yet (e.g. a fresh database on a schedule-only
 * host), it bootstraps a dedicated "system" admin so scheduled jobs still run
 * instead of failing and silently leaving inventory/money unactioned.
 */
class SystemActor
{
    /**
     * The reserved email for the bootstrapped system account. Lower-cased and
     * derived from the host to avoid colliding with a real admin's address.
     */
    public static function email(): string
    {
        $host = strtolower((string) (parse_url((string) Config::get('app.url'), PHP_URL_HOST) ?: 'localhost'));

        return 'system-actor@'.$host;
    }

    public static function getOrCreate(): User
    {
        return User::query()
            ->where('role', UserRole::Admin)
            ->orderBy('id')
            ->first()
            ?? self::bootstrap();
    }

    private static function bootstrap(): User
    {
        return User::query()->create([
            'name' => 'Sistem (Otomatis)',
            'email' => self::email(),
            'role' => UserRole::Admin,
            'password' => Str::password(64),
        ]);
    }
}
