<?php

use App\Enums\UpJurusanConsignmentStatus;
use App\Models\UpJurusanConsignment;
use App\Support\ConsignmentTransitionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

uses(RefreshDatabase::class);

function createReceivedConsignment(int $received, int $sold): UpJurusanConsignment
{
    return UpJurusanConsignment::factory()->create([
        'requested_quantity' => $received,
        'received_quantity' => $received,
        'sold_quantity' => $sold,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);
}

it('re-checks availability on a locked read so a stale instance cannot oversell', function () {
    $consignment = createReceivedConsignment(received: 4, sold: 2);

    ConsignmentTransitionService::recordSold($consignment, 2);

    expect($consignment->fresh()->sold_quantity)->toBe(4)
        ->and($consignment->fresh()->status)->toBe(UpJurusanConsignmentStatus::Completed);

    // Second request still holds its pre-sale snapshot (sold=2, available=2).
    expect(fn () => ConsignmentTransitionService::recordSold($consignment, 1))
        ->toThrow(ValidationException::class);

    expect($consignment->fresh()->sold_quantity)->toBe(4);
});

it('refuses completion when a concurrent reversal made stock unsold', function () {
    $consignment = createReceivedConsignment(received: 3, sold: 3);

    // Concurrent reverse/return lands between our read and the transition.
    DB::table('up_jurusan_consignments')
        ->where('id', $consignment->id)
        ->update(['sold_quantity' => 2]);

    expect(fn () => ConsignmentTransitionService::complete($consignment))
        ->toThrow(ValidationException::class);

    expect($consignment->fresh()->status)->toBe(UpJurusanConsignmentStatus::Received)
        ->and($consignment->fresh()->sold_quantity)->toBe(2);
});

it('refuses a second completion issued from a pre-terminal snapshot', function () {
    $consignment = createReceivedConsignment(received: 3, sold: 3);

    // Someone else completes it before our request commits.
    DB::table('up_jurusan_consignments')
        ->where('id', $consignment->id)
        ->update(['status' => UpJurusanConsignmentStatus::Completed->value]);

    expect(fn () => ConsignmentTransitionService::complete($consignment))
        ->toThrow(ValidationException::class);

    expect($consignment->fresh()->status)->toBe(UpJurusanConsignmentStatus::Completed);
});

it('completes cleanly when the locked read confirms every item is sold', function () {
    $consignment = createReceivedConsignment(received: 3, sold: 3);

    ConsignmentTransitionService::complete($consignment);

    expect($consignment->fresh()->status)->toBe(UpJurusanConsignmentStatus::Completed);
});

it('restores sales against the locked row instead of a stale snapshot', function () {
    $consignment = createReceivedConsignment(received: 4, sold: 4);

    // A concurrent sale already reduced the counter before our restore runs.
    DB::table('up_jurusan_consignments')
        ->where('id', $consignment->id)
        ->update(['sold_quantity' => 2]);

    ConsignmentTransitionService::restoreSold($consignment, 1);

    expect($consignment->fresh()->sold_quantity)->toBe(1)
        ->and($consignment->fresh()->status)->toBe(UpJurusanConsignmentStatus::Received);
});
