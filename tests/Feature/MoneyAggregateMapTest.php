<?php

use App\Enums\StockMovementSource;
use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanPayout;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use App\Support\ActorLifecycle;
use App\Support\MoneyCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * @return array{0: User, 1: User, 2: UpJurusan}
 */
function seedAggregateActors(): array
{
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $up = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);

    return [$admin, $seller, $up];
}

function createConsignmentedProduct(User $seller, UpJurusan $up): UpJurusanConsignment
{
    $product = Product::factory()->for($seller, 'seller')->approved()->create();

    return UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'status' => UpJurusanConsignmentStatus::Received,
        'commission_rate' => 10,
    ]);
}

function createOutMovement(int $consignmentId, int $userId, int $sellerAmount): UpJurusanStockMovement
{
    return UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => $consignmentId,
        'user_id' => $userId,
        'type' => 'out',
        'source' => StockMovementSource::PosSale,
        'quantity' => 1,
        'unit_price' => $sellerAmount,
        'gross_amount' => $sellerAmount,
        'commission_amount' => 0,
        'seller_amount' => $sellerAmount,
    ]);
}

it('builds grouped maps that match the per-consignment sums', function () {
    [$admin, $seller, $up] = seedAggregateActors();

    $withReversal = createConsignmentedProduct($seller, $up);
    $overpaid = createConsignmentedProduct($seller, $up);
    $untouched = createConsignmentedProduct($seller, $up);

    // Original 18000 sale was returned (reversed); a fresh 999 sale remains.
    $returned = createOutMovement($withReversal->id, $admin->id, 18000);
    createOutMovement($withReversal->id, $admin->id, 999);
    UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => $withReversal->id,
        'user_id' => $admin->id,
        'type' => 'in',
        'source' => StockMovementSource::PosSale,
        'quantity' => 1,
        'reverses_movement_id' => $returned->id,
    ]);

    createOutMovement($overpaid->id, $admin->id, 5000);
    UpJurusanPayout::query()->create([
        'up_jurusan_consignment_id' => $overpaid->id,
        'seller_id' => $seller->id,
        'user_id' => $admin->id,
        'amount' => 8000,
    ]);

    $earnings = MoneyCalculationService::sellerEarningsMap([$withReversal->id, $overpaid->id, $untouched->id]);
    $paid = MoneyCalculationService::paidPayoutMap([$withReversal->id, $overpaid->id, $untouched->id]);

    expect($earnings)->toBe([
        $withReversal->id => 999, // reversed movement excluded
        $overpaid->id => 5000,
    ])
        ->and($paid)->toBe([$overpaid->id => 8000])
        ->and($earnings[$withReversal->id])->toBe(MoneyCalculationService::sellerEarningsFromOutMovements($withReversal->id))
        ->and($earnings[$overpaid->id])->toBe(MoneyCalculationService::sellerEarningsFromOutMovements($overpaid->id))
        ->and($paid[$overpaid->id])->toBe(MoneyCalculationService::paidPayoutAmount($overpaid->id))
        // Untouched consignments fall back to zero in list payloads.
        ->and(max(0, ($earnings[$untouched->id] ?? 0) - ($paid[$untouched->id] ?? 0)))
        ->toBe(MoneyCalculationService::unpaidSellerAmount($untouched->id));
});

it('returns empty maps for an empty id list', function () {
    expect(MoneyCalculationService::sellerEarningsMap([]))->toBe([])
        ->and(MoneyCalculationService::paidPayoutMap([]))->toBe([]);
});

it('detects unpaid payouts across a consignment list without per-row queries', function () {
    [$admin, $seller, $up] = seedAggregateActors();

    $payable = createConsignmentedProduct($seller, $up);
    $settled = createConsignmentedProduct($seller, $up);

    createOutMovement($payable->id, $admin->id, 12000);

    createOutMovement($settled->id, $admin->id, 9000);
    UpJurusanPayout::query()->create([
        'up_jurusan_consignment_id' => $settled->id,
        'seller_id' => $seller->id,
        'user_id' => $admin->id,
        'amount' => 9000,
    ]);

    expect(ActorLifecycle::userHasUnpaidPayouts($seller))->toBeTrue()
        ->and(ActorLifecycle::upJurusanHasUnpaidPayouts($up))->toBeTrue();

    // Settle the last payable balance.
    UpJurusanPayout::query()->create([
        'up_jurusan_consignment_id' => $payable->id,
        'seller_id' => $seller->id,
        'user_id' => $admin->id,
        'amount' => 12000,
    ]);

    expect(ActorLifecycle::userHasUnpaidPayouts($seller))->toBeFalse()
        ->and(ActorLifecycle::upJurusanHasUnpaidPayouts($up))->toBeFalse();
});
