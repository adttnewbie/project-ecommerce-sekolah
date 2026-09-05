<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use App\Support\CatalogProductPayload;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function __construct(private CatalogProductPayload $payload) {}

    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $products = Product::query()
            ->tap(fn ($q) => $this->payload->cardRelations($q, $user))
            ->whereHas('wishlists', fn ($q) => $q->where('user_id', $user->id))
            ->orderByDesc(Wishlist::select('created_at')->whereColumn('product_id', 'products.id')->where('user_id', $user->id))
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product): array => $this->payload->map($product, $user));

        return Inertia::render('wishlist/index', ['products' => $products]);
    }

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
