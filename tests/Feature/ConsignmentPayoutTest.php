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
use App\Support\ConsignmentPayoutService;
use App\Support\MoneyCalculationService;
use Illuminate\Support\Facades\DB;

/**
 * Arrange an admin jurusan + consignment with a payable seller balance.
 *
 * 2 units of a 10.000 IDR product sold at 10% commission => 18.000 IDR payable.
 *
 * @return array{0: User, 1: UpJurusanConsignment, 2: int}
 */
function payoutFixture(): array
{
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $up = UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create(['price' => 10000]);
    $consignment = UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'status' => UpJurusanConsignmentStatus::Received,
        'commission_rate' => 10,
        'received_quantity' => 5,
        'sold_quantity' => 2,
    ]);

    $money = MoneyCalculationService::consignmentSaleSplit(10000, 2, 10);

    UpJurusanStockMovement::query()->create([
        'up_jurusan_consignment_id' => $consignment->id,
        'user_id' => $admin->id,
        'type' => 'out',
        'source' => StockMovementSource::PosSale,
        'quantity' => 2,
        ...$money,
    ]);

    return [$admin, $consignment, $money['seller_amount']];
}

test('admin jurusan can payout the full unpaid balance', function () {
    [$admin, $consignment, $balance] = payoutFixture();

    $this->actingAs($admin)
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $balance,
            'note' => 'Pelunasan',
        ])
        ->assertRedirect(route('admin-jurusan.consignments.show', $consignment));

    $this->assertDatabaseHas('up_jurusan_payouts', [
        'up_jurusan_consignment_id' => $consignment->id,
        'user_id' => $admin->id,
        'amount' => $balance,
        'note' => 'Pelunasan',
    ]);

    expect(MoneyCalculationService::unpaidSellerAmount($consignment->id))->toBe(0);
});

test('admin jurusan can payout part of the unpaid balance and the remainder stays payable', function () {
    [$admin, $consignment, $balance] = payoutFixture();

    $partial = (int) ($balance / 2);

    $this->actingAs($admin)
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $partial,
        ])
        ->assertRedirect(route('admin-jurusan.consignments.show', $consignment));

    expect(MoneyCalculationService::unpaidSellerAmount($consignment->id))->toBe($balance - $partial);

    $this->actingAs($admin)
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $balance - $partial,
        ])
        ->assertRedirect(route('admin-jurusan.consignments.show', $consignment));

    expect(MoneyCalculationService::unpaidSellerAmount($consignment->id))->toBe(0);
});

test('payout exceeding the unpaid balance is rejected with the existing message', function () {
    [$admin, $consignment, $balance] = payoutFixture();

    $this->actingAs($admin)
        ->from(route('admin-jurusan.consignments.show', $consignment))
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $balance + 1,
        ])
        ->assertSessionHasErrors(['amount' => 'Jumlah pencairan melebihi saldo seller.']);

    expect(MoneyCalculationService::unpaidSellerAmount($consignment->id))->toBe($balance)
        ->and(UpJurusanPayout::query()->count())->toBe(0);
});

test('payout amount must be at least 1', function () {
    [$admin, $consignment] = payoutFixture();

    $this->actingAs($admin)
        ->from(route('admin-jurusan.consignments.show', $consignment))
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => 0,
        ])
        ->assertSessionHasErrors('amount');

    expect(UpJurusanPayout::query()->count())->toBe(0);
});

test('concurrent payout requests using a stale balance cannot overpay', function () {
    [$admin, $consignment, $balance] = payoutFixture();

    $staleBalance = MoneyCalculationService::unpaidSellerAmount($consignment->id);

    $this->actingAs($admin)
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $staleBalance,
        ])
        ->assertRedirect();

    $this->actingAs($admin)
        ->from(route('admin-jurusan.consignments.show', $consignment))
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $staleBalance,
        ])
        ->assertSessionHasErrors(['amount' => 'Jumlah pencairan melebihi saldo seller.']);

    $paid = (int) UpJurusanPayout::query()
        ->where('up_jurusan_consignment_id', $consignment->id)
        ->sum('amount');

    expect($paid)->toBe($balance)
        ->and(MoneyCalculationService::unpaidSellerAmount($consignment->id))->toBe(0);
});

test('concurrent payout requests against the same stale balance never exceed the earned amount', function () {
    [$admin, $consignment, $balance] = payoutFixture();

    $staleBalance = MoneyCalculationService::unpaidSellerAmount($consignment->id);

    ConsignmentPayoutService::execute($consignment, $admin, $staleBalance);

    $this->actingAs($admin)
        ->from(route('admin-jurusan.consignments.show', $consignment))
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $staleBalance,
        ])
        ->assertSessionHasErrors(['amount' => 'Jumlah pencairan melebihi saldo seller.']);

    $paid = (int) UpJurusanPayout::query()
        ->where('up_jurusan_consignment_id', $consignment->id)
        ->sum('amount');

    expect($paid)->toBe($balance);
});

test('payout locks the consignment row inside a transaction', function () {
    if (DB::getDriverName() !== 'mysql') {
        $this->markTestSkipped('Row-level locks are only enforced on MySQL/PostgreSQL.');
    }

    [$admin, $consignment, $balance] = payoutFixture();

    $executed = [];
    DB::listen(function ($query) use (&$executed) {
        $executed[] = $query->sql;
    });

    $this->actingAs($admin)
        ->post(route('admin-jurusan.consignments.payout', $consignment), [
            'amount' => $balance,
        ])
        ->assertRedirect();

    $hasLockingRead = collect($executed)
        ->contains(fn (string $sql) => str_contains(strtolower($sql), 'for update'));

    expect($hasLockingRead)->toBeTrue();
});
