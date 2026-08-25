<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function toggle(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['message' => 'Unauthenticated.', 'redirect' => route('login')], 401);
            }

            return redirect()->route('login');
        }

        $existing = Wishlist::query()
            ->where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            $existing->delete();

            $payload = ['is_wishlisted' => false, 'message' => 'Dihapus dari wishlist.'];
        } else {
            try {
                Wishlist::query()->create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ]);
            } catch (UniqueConstraintViolationException) {
                // A concurrent toggle already created the row: report the
                // wishlisted state instead of failing the request.
            }

            $payload = ['is_wishlisted' => true, 'message' => 'Ditambahkan ke wishlist.'];
        }

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json($payload);
        }

        return back()->with('success', $payload['message']);
    }
}
