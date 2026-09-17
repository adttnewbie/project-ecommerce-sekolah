<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferencesController extends Controller
{
    /**
     * Display notification preferences page.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $preferences = NotificationPreference::where('user_id', $user->id)
            ->get()
            ->keyBy('type');

        // Fill in missing types with defaults.
        // In-app only (MVP): tidak ada sistem email notifikasi, jadi
        // email_enabled selalu false dan tidak diekspos sebagai opsi.
        // 'promotion' sengaja tidak didaftarkan: tidak ada listener yang
        // mengirim type itu (enum case dipertahankan untuk kompatibilitas DB).
        $allTypes = ['order', 'stock', 'product', 'review', 'payment', 'system'];
        foreach ($allTypes as $type) {
            if (! $preferences->has($type)) {
                $preferences[$type] = new NotificationPreference([
                    'type' => $type,
                    'in_app_enabled' => true,
                    'email_enabled' => false,
                ]);
            }
        }

        return Inertia::render('Notifications/Preferences', [
            'preferences' => $preferences->toArray(),
        ]);
    }

    /**
     * Update notification preferences (in-app only; email tidak didukung MVP).
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences.*.in_app_enabled' => 'boolean',
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var array<string, array<string, bool>> $preferences */
        $preferences = $validated['preferences'] ?? [];

        collect($preferences)->each(function (array $prefData, string $type) use ($user): void {
            NotificationPreference::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'type' => $type,
                ],
                [
                    'in_app_enabled' => (bool) ($prefData['in_app_enabled'] ?? true),
                    // Kolom email_enabled dipertahankan di schema (non-destruktif)
                    // tapi selalu false: tidak ada pengiriman email notifikasi.
                    'email_enabled' => false,
                ]
            );
        });

        return back()->with('toast', ['message' => 'Pengaturan notifikasi disimpan']);
    }
}
