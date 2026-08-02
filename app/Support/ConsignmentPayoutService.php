<?php

namespace App\Support;

use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanPayout;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConsignmentPayoutService
{
    /**
     * Record a seller payout for a consignment.
     *
     * The unpaid balance is recalculated inside a DB transaction while the
     * consignment row is locked with lockForUpdate(), so concurrent payout
     * requests for the same consignment are serialized and can never pay out
     * more than the remaining balance.
     *
     * @throws ValidationException When the requested amount exceeds the unpaid balance.
     */
    public static function execute(
        UpJurusanConsignment $consignment,
        User $adminJurusan,
        int $amount,
        ?string $note = null,
    ): UpJurusanPayout {
        return DB::transaction(function () use ($consignment, $adminJurusan, $amount, $note) {
            /** @var UpJurusanConsignment $current */
            $current = UpJurusanConsignment::query()
                ->lockForUpdate()
                ->findOrFail($consignment->id);

            $unpaidAmount = MoneyCalculationService::unpaidSellerAmount($current->id);

            if ($amount > $unpaidAmount) {
                throw ValidationException::withMessages([
                    'amount' => 'Jumlah pencairan melebihi saldo seller.',
                ]);
            }

            return UpJurusanPayout::query()->create([
                'up_jurusan_consignment_id' => $current->id,
                'seller_id' => $current->seller_id,
                'user_id' => $adminJurusan->id,
                'amount' => $amount,
                'note' => $note,
            ]);
        });
    }
}
