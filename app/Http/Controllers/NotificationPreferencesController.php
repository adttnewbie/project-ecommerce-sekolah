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

        // Fill in missing types with defaults
        $allTypes = ['order', 'stock', 'product', 'payment', 'system', 'promotion'];
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
     * Update notification preferences.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences.*.in_app_enabled' => 'boolean',
            'preferences.*.email_enabled' => 'boolean',
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
                    'email_enabled' => (bool) ($prefData['email_enabled'] ?? false),
                ]
            );
        });

        return back()->with('toast', ['message' => 'Pengaturan notifikasi disimpan']);
    }
}
