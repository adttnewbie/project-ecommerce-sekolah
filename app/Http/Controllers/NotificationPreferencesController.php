<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationPreferencesController extends Controller
{
    /**
     * Display notification preferences page.
     */
    public function index()
    {
        $user = auth()->user();
        
        $preferences = NotificationPreference::where('user_id', $user->id)
            ->get()
            ->keyBy('type');

        // Fill in missing types with defaults
        $allTypes = ['order', 'stock', 'product', 'payment', 'system', 'promotion'];
        foreach ($allTypes as $type) {
            if (!$preferences->has($type)) {
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
    public function update(Request $request)
    {
        $validated = $request->validate([
            'preferences.*.in_app_enabled' => 'boolean',
            'preferences.*.email_enabled' => 'boolean',
        ]);

        $user = auth()->user();

        collect($validated['preferences'])->each(function ($prefData, $type) use ($user) {
            NotificationPreference::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'type' => $type,
                ],
                [
                    'in_app_enabled' => $prefData['in_app_enabled'],
                    'email_enabled' => $prefData['email_enabled'],
                ]
            );
        });

        return back()->with('toast', ['message' => 'Pengaturan notifikasi disimpan']);
    }
}
