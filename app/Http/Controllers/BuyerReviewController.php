<?php

namespace App\Http\Controllers;

use App\Enums\OrderItemStatus;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BuyerReviewController extends Controller
{
    public function store(Request $request, Product $product): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $this->validatePayload($request);

        self::assertHasCompletedPurchase($product, $user);
        self::assertNotReviewedYet($product, $user);

        try {
            Review::query()->create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);
        } catch (UniqueConstraintViolationException) {
            // A concurrent submit won the unique (product, user) race; the
            // buyer effectively already has their review in place.
        }

        return redirect()
            ->route('catalog.show', $product)
            ->with('success', 'Ulasan berhasil dikirim. Terima kasih!');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Review|null $review */
        $review = Review::query()
            ->where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->first();

        abort_unless($review !== null, 404);

        $validated = $this->validatePayload($request);

        $review->update([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return redirect()
            ->route('catalog.show', $product)
            ->with('success', 'Ulasan berhasil diperbarui.');
    }

    /**
     * @return array{rating: int, comment: string|null}
     */
    private function validatePayload(Request $request): array
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        return [
            'rating' => (int) $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ];
    }

    private static function assertHasCompletedPurchase(Product $product, User $user): void
    {
        $hasCompleted = OrderItem::query()
            ->where('product_id', $product->id)
            ->where('status', OrderItemStatus::Completed)
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
            ->exists();

        if (! $hasCompleted) {
            throw ValidationException::withMessages([
                'review' => 'Selesaikan pesanan produk ini terlebih dahulu untuk memberi ulasan.',
            ])->redirectTo(route('catalog.show', $product));
        }
    }

    private static function assertNotReviewedYet(Product $product, User $user): void
    {
        $alreadyReviewed = Review::query()
            ->where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyReviewed) {
            throw ValidationException::withMessages([
                'review' => 'Kamu sudah memberi ulasan untuk produk ini.',
            ])->redirectTo(route('catalog.show', $product));
        }
    }
}
