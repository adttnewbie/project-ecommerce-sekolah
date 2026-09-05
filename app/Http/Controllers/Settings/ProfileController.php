<?php

namespace App\Http\Controllers\Settings;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Wishlist;
use App\Support\ActorLifecycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === UserRole::Buyer) {
            return Inertia::render('account/index', [
                'status' => $request->session()->get('status'),
                'accountSummary' => $this->accountSummary($user),
            ]);
        }

        return Inertia::render('settings/profile', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * @return array{cart_count:int,wishlist_count:int,orders_total:int,orders_by_status:array{unpaid:int,packing:int,shipping:int,done:int}}
     */
    private function accountSummary(User $user): array
    {
        try {
            return [
                'cart_count' => CartItem::query()->where('user_id', $user->id)->count(),
                'wishlist_count' => Wishlist::query()->where('user_id', $user->id)->count(),
                'orders_total' => (int) Order::query()->where('user_id', $user->id)->count(),
                'orders_by_status' => [
                    'unpaid' => (int) Order::query()->where('user_id', $user->id)
                        ->where('payment_status', PaymentStatus::Unpaid->value)->count(),
                    'packing' => (int) OrderItem::query()
                        ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
                        ->where('status', OrderItemStatus::Packed->value)->count(),
                    'shipping' => (int) OrderItem::query()
                        ->whereHas('order', fn ($q) => $q->where('user_id', $user->id))
                        ->where('status', OrderItemStatus::Sent->value)->count(),
                    'done' => (int) Order::query()->where('user_id', $user->id)
                        ->where('status', OrderStatus::Completed->value)->count(),
                ],
            ];
        } catch (\Throwable $e) {
            report($e);

            return [
                'cart_count' => 0,
                'wishlist_count' => 0,
                'orders_total' => 0,
                'orders_by_status' => ['unpaid' => 0, 'packing' => 0, 'shipping' => 0, 'done' => 0],
            ];
        }
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        $request->user()->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        ActorLifecycle::assertCanDeleteAccount($user);
        $this->authorize('delete', $user);

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
