<?php

namespace App\Http\Controllers;

use App\Support\DeliveryFeeSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminDeliveryFeeSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('admin/settings/delivery-fee', [
            'delivery_fee_tiers' => DeliveryFeeSettings::tiers(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tiers' => ['required', 'array', 'min:1', 'max:'.DeliveryFeeSettings::MAX_TIERS],
            'tiers.*.min_spend' => ['required', 'integer', 'min:0'],
            'tiers.*.fee' => ['required', 'integer', 'min:0'],
        ]);

        $tiers = [];

        foreach ($validated['tiers'] as $tier) {
            if (! is_array($tier)) {
                continue;
            }

            $tiers[] = [
                'min_spend' => (int) $tier['min_spend'],
                'fee' => (int) $tier['fee'],
            ];
        }

        usort($tiers, fn (array $a, array $b): int => $a['min_spend'] <=> $b['min_spend']);

        self::assertBaseRuleExists($tiers);
        self::assertMinimumsUnique($tiers);

        DeliveryFeeSettings::updateTiers($tiers);

        return to_route('admin.settings.delivery-fee.edit')
            ->with('success', 'Aturan biaya antar berhasil diperbarui.');
    }

    /**
     * The base rule at Rp 0 is mandatory so every delivery order matches a tier.
     *
     * @param  list<array{min_spend: int, fee: int}>  $tiers
     */
    private static function assertBaseRuleExists(array $tiers): void
    {
        if ($tiers === [] || $tiers[0]['min_spend'] !== 0) {
            throw ValidationException::withMessages([
                'tiers' => 'Aturan pertama wajib memiliki minimal belanja Rp 0.',
            ])->redirectTo(route('admin.settings.delivery-fee.edit'));
        }
    }

    /**
     * @param  list<array{min_spend: int, fee: int}>  $tiers
     */
    private static function assertMinimumsUnique(array $tiers): void
    {
        $minimums = array_map(fn (array $tier): int => $tier['min_spend'], $tiers);

        if (count($minimums) !== count(array_unique($minimums))) {
            throw ValidationException::withMessages([
                'tiers' => 'Minimal belanja pada setiap aturan tidak boleh sama.',
            ])->redirectTo(route('admin.settings.delivery-fee.edit'));
        }
    }
}
