<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ShoppingModeController extends Controller
{
    /**
     * Enter shopping (buyer) mode. Sellers keep their role - this only flips
     * a session flag so the UI switches to the buyer experience.
     */
    public function enter(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->role === UserRole::Seller, 403);

        $request->session()->put('shopping_mode', 'buyer');

        return redirect()->route('home');
    }

    /**
     * Leave shopping mode and return to the seller workspace.
     */
    public function leave(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        abort_unless($user->role === UserRole::Seller, 403);

        $request->session()->forget('shopping_mode');

        return redirect()->route('seller.dashboard');
    }
}
