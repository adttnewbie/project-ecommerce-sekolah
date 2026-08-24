<?php

namespace App\Support;

use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Re-runs a database write after losing a unique-index race (SQLSTATE 23000),
 * e.g. transaction codes picked by an exists() probe that cannot see other
 * connections' uncommitted rows.
 */
class UniqueViolationRetry
{
    /**
     * @template TReturn
     *
     * @param  callable(): TReturn  $callback
     * @return TReturn
     */
    public static function run(callable $callback, int $maxAttempts = 3): mixed
    {
        try {
            return $callback();
        } catch (UniqueConstraintViolationException $exception) {
            if ($maxAttempts <= 1) {
                throw $exception;
            }

            return self::run($callback, $maxAttempts - 1);
        }
    }
}
