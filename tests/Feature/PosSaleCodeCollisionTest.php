<?php

use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanPosSale;
use App\Models\User;
use App\Support\UniqueViolationRetry;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function failPosSaleInsertOnAttempts(int ...$failingAttempts): void
{
    $attempt = 0;

    UpJurusanPosSale::creating(function () use (&$attempt, $failingAttempts): bool {
        $attempt++;

        if (in_array($attempt, $failingAttempts, true)) {
            throw new UniqueConstraintViolationException(
                'sqlite',
                'insert into "up_jurusan_pos_sales" ("code") values (?)',
                [],
                new RuntimeException('SQLITE_CONSTRAINT: UNIQUE constraint failed: up_jurusan_pos_sales.code'),
            );
        }

        return true;
    });
}

/**
 * @return array{User, UpJurusanConsignment}
 */
function seedAssignedPicketWithConsignment(): array
{
    $upJurusan = UpJurusan::factory()->create();
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->create(['price' => 5000]);
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $upJurusan->id,
        'received_quantity' => 5,
        'sold_quantity' => 1,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);

    return [$picket, $consignment];
}

it('retries the pos sale when the generated code collides with a concurrent insert', function () {
    [$picket, $consignment] = seedAssignedPicketWithConsignment();
    failPosSaleInsertOnAttempts(1);

    $response = $this->actingAs($picket)
        ->post(route('picket.up-jurusan.sales.store'), [
            'items' => [
                ['id' => $consignment->id, 'source' => 'consignment', 'quantity' => 2],
            ],
        ])
        ->assertRedirect(route('picket.pos'));

    expect(UpJurusanPosSale::query()->count())->toBe(1);

    $this->assertDatabaseHas('up_jurusan_consignments', [
        'id' => $consignment->id,
        'sold_quantity' => 3,
    ]);

    $sale = UpJurusanPosSale::query()->sole();
    expect($sale->total_quantity)->toBe(2)
        ->and($response->getSession()->get('success'))->toContain($sale->code);
});

it('surfaces the violation instead of looping forever when every attempt collides', function () {
    [$picket, $consignment] = seedAssignedPicketWithConsignment();
    failPosSaleInsertOnAttempts(1, 2, 3);

    $this->actingAs($picket)
        ->post(route('picket.up-jurusan.sales.store'), [
            'items' => [
                ['id' => $consignment->id, 'source' => 'consignment', 'quantity' => 1],
            ],
        ])
        ->assertServerError();

    expect(UpJurusanPosSale::query()->count())->toBe(0)
        ->and($consignment->fresh()->sold_quantity)->toBe(1);
});

it('gives up after the configured number of attempts when invoked directly', function () {
    $exception = new UniqueConstraintViolationException(
        'sqlite',
        'insert into "t" values (1)',
        [],
        new RuntimeException('UNIQUE constraint failed'),
    );
    $attempts = 0;
    $threw = false;

    try {
        UniqueViolationRetry::run(function () use (&$attempts, $exception): void {
            $attempts++;

            throw $exception;
        });
    } catch (UniqueConstraintViolationException) {
        $threw = true;
    }

    expect($threw)->toBeTrue();
    expect($attempts)->toBe(3);
});
