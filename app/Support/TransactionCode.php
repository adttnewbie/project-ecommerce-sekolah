<?php

namespace App\Support;

use Illuminate\Support\Str;
use RuntimeException;

class TransactionCode
{
    private const PREFIX = 'TRX-';

    private const RANDOM_LENGTH = 4;

    private const MAX_ATTEMPTS = 5;

    public static function make(): string
    {
        return self::generate();
    }

    /**
     * Generate a transaction code that is unique according to the given
     * existence check, retrying with a fresh random suffix on collision.
     *
     * @param  callable(string): bool  $exists
     */
    public static function unique(callable $exists, int $attempts = self::MAX_ATTEMPTS): string
    {
        for ($attempt = 1; $attempt <= $attempts; $attempt++) {
            $code = self::generate();

            if (! $exists($code)) {
                return $code;
            }
        }

        throw new RuntimeException(
            "Unable to generate a unique transaction code after {$attempts} attempts.",
        );
    }

    private static function generate(): string
    {
        return self::PREFIX.now()->format('YmdHis').'-'.Str::upper(Str::random(self::RANDOM_LENGTH));
    }
}
