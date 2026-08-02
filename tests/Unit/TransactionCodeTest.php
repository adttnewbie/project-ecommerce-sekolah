<?php

use App\Support\TransactionCode;
use Illuminate\Support\Carbon;

function setTestNow(string $time): void
{
    Carbon::setTestNow($time);
}

function resetTestNow(): void
{
    Carbon::setTestNow();
}

test('make returns a transaction code in the TRX format', function () {
    setTestNow('2026-08-02 10:30:45');

    $code = TransactionCode::make();

    resetTestNow();

    expect($code)->toMatch('/^TRX-20260802103045-[A-Z0-9]{4}$/');
});

test('unique returns the first non-existing code', function () {
    setTestNow('2026-08-02 10:30:45');

    $existing = ['TRX-20260802103045-ABCD', 'TRX-20260802103045-EFGH'];

    $code = TransactionCode::unique(
        fn (string $code): bool => in_array($code, $existing, true),
    );

    resetTestNow();

    expect($code)->toMatch('/^TRX-20260802103045-[A-Z0-9]{4}$/');
});

test('unique retries with a fresh suffix when the code collides', function () {
    $attempts = 0;

    $code = TransactionCode::unique(function (string $code) use (&$attempts): bool {
        $attempts++;

        return $attempts <= 2;
    });

    expect($attempts)->toBe(3)
        ->and($code)->toMatch('/^TRX-[0-9]{14}-[A-Z0-9]{4}$/');
});

test('unique throws after exhausting retries', function () {
    $attempts = 0;

    $code = TransactionCode::unique(function () use (&$attempts): bool {
        $attempts++;

        return true;
    });

    expect($code)->toBe('never reached');
})->throws(RuntimeException::class, 'Unable to generate a unique transaction code');

test('unique honours a custom attempt limit', function () {
    $attempts = 0;

    TransactionCode::unique(
        function () use (&$attempts): bool {
            $attempts++;

            return true;
        },
        attempts: 2,
    );

    expect($attempts)->toBe(2);
})->throws(RuntimeException::class);
