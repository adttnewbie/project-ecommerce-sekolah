<?php

use App\Enums\ProductSalesMethod;
use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Models\DomainEvent;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use App\Support\ConsignmentTransitionService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Genuine concurrency tests for consignment cancel racing receive / cancel / sale.
 *
 * Two independent processes race the same transition on a shared file-backed
 * SQLite database (WAL + busy_timeout), mirroring the row-lock serialization used
 * by the real MySQL/PostgreSQL flow. The assertions target invariants that a
 * correct locking implementation must always uphold:
 *   - a Cancelled consignment never retains received_quantity / sold_quantity > 0
 *   - only one transition wins from the same initial state
 *   - exactly one domain event is recorded per logical transition
 */
function consignmentConcurrencyDb(string $name): string
{
    if (! function_exists('pcntl_fork')) {
        return '';
    }

    $dir = sys_get_temp_dir().'/'.$name.'_'.uniqid();
    mkdir($dir);
    $dbFile = $dir.'/db.sqlite';
    touch($dbFile);

    config(['database.default' => 'concurrency']);
    config(['database.connections.concurrency' => [
        'driver' => 'sqlite',
        'database' => $dbFile,
        'prefix' => '',
        'foreign_key_constraints' => true,
    ]]);
    DB::purge('concurrency');
    Artisan::call('migrate:fresh', ['--database' => 'concurrency']);

    return $dbFile;
}

function consignmentRunner(): Closure
{
    return function (string $readyFile, string $goFile, Closure $op) {
        try {
            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');
            DB::statement('PRAGMA journal_mode = WAL');

            touch($readyFile);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }

            $op();
        } catch (Throwable) {
            exit(1);
        }

        exit(0);
    };
}

function consignmentForkWait(Closure $a, Closure $b, string $dir, Closure $assert): void
{
    $readyA = $dir.'/ready_a';
    $readyB = $dir.'/ready_b';
    $goFile = $dir.'/go';
    $runner = consignmentRunner();

    $pidA = pcntl_fork();
    if ($pidA === -1) {
        test()->fail('Unable to fork process A.');
    }
    if ($pidA === 0) {
        $runner($readyA, $goFile, $a);
    }

    $pidB = pcntl_fork();
    if ($pidB === -1) {
        test()->fail('Unable to fork process B.');
    }
    if ($pidB === 0) {
        $runner($readyB, $goFile, $b);
    }

    $deadline = microtime(true) + 10;
    while ((! file_exists($readyA) || ! file_exists($readyB)) && microtime(true) < $deadline) {
        usleep(1000);
    }
    touch($goFile);

    pcntl_waitpid($pidA, $statusA);
    pcntl_waitpid($pidB, $statusB);

    try {
        $succeededA = pcntl_wifexited($statusA) && pcntl_wexitstatus($statusA) === 0;
        $succeededB = pcntl_wifexited($statusB) && pcntl_wexitstatus($statusB) === 0;

        $assert($succeededA, $succeededB);
    } finally {
        config(['database.default' => 'sqlite']);
        DB::purge('concurrency');
        foreach (['', '-wal', '-shm'] as $suffix) {
            @unlink($dir.'/db.sqlite'.$suffix);
        }
        @unlink($readyA);
        @unlink($readyB);
        @unlink($goFile);
        @rmdir($dir);
    }
}

test('concurrent cancel and receive cannot produce a cancelled consignment with stock', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = consignmentConcurrencyDb('cancel_receive');
    $dir = dirname($dbFile);

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);
    $up = UpJurusan::factory()->create();
    $product = Product::factory()
        ->for($seller, 'seller')
        ->approved()
        ->create(['sales_method' => ProductSalesMethod::UpJurusan]);
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'requested_quantity' => 10,
        'received_quantity' => 0,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Approved,
    ]);
    $id = $consignment->id;
    $picketId = $picket->id;

    DB::purge('concurrency');

    consignmentForkWait(
        fn () => DB::transaction(function () use ($id) {
            ConsignmentTransitionService::cancel(UpJurusanConsignment::findOrFail($id), 'Concurrent cancel');
        }),
        fn () => DB::transaction(function () use ($id, $picketId) {
            $picket = User::findOrFail($picketId);
            ConsignmentTransitionService::receive(UpJurusanConsignment::findOrFail($id), 5, $picket);
        }),
        $dir,
        function (bool $cancelSucceeded, bool $receiveSucceeded) use ($id) {
            expect($cancelSucceeded || $receiveSucceeded)
                ->toBeTrue('At least one of cancel/receive should succeed.');

            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');

            $final = UpJurusanConsignment::findOrFail($id);

            if ($final->status === UpJurusanConsignmentStatus::Cancelled) {
                expect($final->received_quantity)->toBe(0)
                    ->and($final->sold_quantity)->toBe(0);
                expect(UpJurusanStockMovement::query()
                    ->where('up_jurusan_consignment_id', $id)
                    ->where('type', 'in')
                    ->count())->toBe(0);
            } else {
                expect($final->status)->toBe(UpJurusanConsignmentStatus::Received)
                    ->and($final->received_quantity)->toBeGreaterThan(0);
            }
        },
    );

    // cleanup happens in consignmentForkWait via $dir
    config(['database.default' => 'sqlite']);
});

test('concurrent receive and cancel produce a consistent final state', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = consignmentConcurrencyDb('receive_cancel');
    $dir = dirname($dbFile);

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);
    $up = UpJurusan::factory()->create();
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'requested_quantity' => 10,
        'received_quantity' => 0,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Approved,
    ]);
    $id = $consignment->id;
    $picketId = $picket->id;

    DB::purge('concurrency');

    consignmentForkWait(
        fn () => DB::transaction(function () use ($id, $picketId) {
            $picket = User::findOrFail($picketId);
            ConsignmentTransitionService::receive(UpJurusanConsignment::findOrFail($id), 5, $picket);
        }),
        fn () => DB::transaction(function () use ($id) {
            ConsignmentTransitionService::cancel(UpJurusanConsignment::findOrFail($id), 'Concurrent cancel');
        }),
        $dir,
        function (bool $receiveSucceeded, bool $cancelSucceeded) use ($id) {
            expect($receiveSucceeded || $cancelSucceeded)->toBeTrue();

            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');

            $final = UpJurusanConsignment::findOrFail($id);

            if ($final->status === UpJurusanConsignmentStatus::Cancelled) {
                expect($final->received_quantity)->toBe(0)
                    ->and(UpJurusanStockMovement::query()
                        ->where('up_jurusan_consignment_id', $id)
                        ->where('type', 'in')
                        ->count())->toBe(0);
            } else {
                expect($final->status)->toBe(UpJurusanConsignmentStatus::Received)
                    ->and($final->received_quantity)->toBeGreaterThan(0);
            }
        },
    );

    config(['database.default' => 'sqlite']);
});

test('concurrent cancel and cancel record exactly one event', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = consignmentConcurrencyDb('cancel_cancel');
    $dir = dirname($dbFile);

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $up = UpJurusan::factory()->create();
    $product = Product::factory()->for($seller, 'seller')->approved()->create();
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'requested_quantity' => 10,
        'received_quantity' => 0,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Approved,
    ]);
    $id = $consignment->id;

    DB::purge('concurrency');

    consignmentForkWait(
        fn () => DB::transaction(function () use ($id) {
            ConsignmentTransitionService::cancel(UpJurusanConsignment::findOrFail($id), 'Cancel A');
        }),
        fn () => DB::transaction(function () use ($id) {
            ConsignmentTransitionService::cancel(UpJurusanConsignment::findOrFail($id), 'Cancel B');
        }),
        $dir,
        function (bool $a, bool $b) use ($id) {
            expect($a || $b)->toBeTrue('At least one cancel should succeed.');

            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');

            $final = UpJurusanConsignment::findOrFail($id);
            expect($final->status)->toBe(UpJurusanConsignmentStatus::Cancelled)
                ->and($final->received_quantity)->toBe(0)
                ->and($final->sold_quantity)->toBe(0);

            expect(DomainEvent::query()
                ->where('event_type', 'consignment_cancelled')
                ->where('aggregate_id', $id)
                ->count())->toBe(1);
        },
    );

    config(['database.default' => 'sqlite']);
});

test('cancel cannot corrupt a consignment that has already been sold', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = consignmentConcurrencyDb('cancel_sale');
    $dir = dirname($dbFile);

    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);
    $up = UpJurusan::factory()->create();
    $product = Product::factory()
        ->for($seller, 'seller')
        ->approved()
        ->create(['sales_method' => ProductSalesMethod::UpJurusan, 'price' => 10000]);
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'requested_quantity' => 10,
        'received_quantity' => 5,
        'sold_quantity' => 0,
        'commission_rate' => 10,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);
    $id = $consignment->id;
    $picketId = $picket->id;

    DB::purge('concurrency');

    consignmentForkWait(
        fn () => DB::transaction(function () use ($id, $picketId) {
            /** @var UpJurusanConsignment $locked */
            $locked = UpJurusanConsignment::query()
                ->lockForUpdate()
                ->findOrFail($id);
            $picket = User::findOrFail($picketId);
            ConsignmentTransitionService::recordSold($locked, 3, $picket);
        }),
        fn () => DB::transaction(function () use ($id) {
            ConsignmentTransitionService::cancel(UpJurusanConsignment::findOrFail($id), 'Concurrent cancel');
        }),
        $dir,
        function (bool $saleSucceeded, bool $cancelSucceeded) use ($id) {
            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');

            $final = UpJurusanConsignment::findOrFail($id);

            // The security property: cancel must NEVER turn a sold/received
            // consignment into a Cancelled state with retained stock.
            expect($final->status)->not->toBe(UpJurusanConsignmentStatus::Cancelled)
                ->and($final->received_quantity)->toBe(5);

            if ($saleSucceeded) {
                expect($final->sold_quantity)->toBe(3)
                    ->and($final->status)->toBeIn([
                        UpJurusanConsignmentStatus::Received,
                        UpJurusanConsignmentStatus::Completed,
                    ]);
                if ($final->status === UpJurusanConsignmentStatus::Completed) {
                    expect($final->sold_quantity)->toBe($final->received_quantity);
                }
            } else {
                // Sale lost the SQLite writer-writer lock race to cancel (received>0
                // always makes cancel fail), or both contended. Stock must be untouched.
                expect($final->sold_quantity)->toBe(0);
            }
        },
    );

    config(['database.default' => 'sqlite']);
});
