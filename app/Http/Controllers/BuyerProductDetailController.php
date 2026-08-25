<?php

namespace App\Http\Controllers;

use App\Enums\OrderItemStatus;
use App\Enums\ProductStatus;
use App\Models\Product;
use App\Traits\OwnerPayloadHelper;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerProductDetailController extends Controller
{
    use OwnerPayloadHelper;

    public function __invoke(Request $request, Product $product): Response
    {
        abort_unless($product->status === ProductStatus::Approved, 404);

        $product->load([
            'category:id,name,slug',
            'seller:id,name',
            'upJurusan:id,name',
            'upJurusanConsignments.upJurusan:id,name',
        ]);

        $pickupPlace = $product->upJurusanConsignments
            ->first()
            ?->upJurusan;

        // Eager aggregates: sold_count, review_summary, wishlist
        $soldCount = $product->orderItems()
            ->where('status', OrderItemStatus::Completed)
            ->sum('quantity');
        $soldCount = $soldCount > 0 ? (int) $soldCount : null;

        $reviewCount = $product->reviews()->count();
        $reviewAvg = $reviewCount > 0 ? $product->reviews()->avg('rating') : null;
        $reviewSummary = null;
        if ($reviewCount > 0 && $reviewAvg !== null) {
            $reviewSummary = [
                'average' => round((float) $reviewAvg, 1),
                'count' => $reviewCount,
            ];
        }

        $isWishlisted = false;
        if ($request->user()) {
            $isWishlisted = $product->wishlists()
                ->where('user_id', $request->user()->id)
                ->exists();
        }

        $showOriginal = $product->original_price !== null && $product->original_price > $product->price;

        return Inertia::render('catalog/show', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'original_price' => $showOriginal ? $product->original_price : null,
                'stock' => $product->availableStock(),
                'is_pre_order' => $product->isPreOrder(),
                'fulfillment_type' => [
                    'code' => $product->fulfillment_type->value,
                    'label' => $product->fulfillment_type->label(),
                ],
                'pre_order_estimate_days' => $product->pre_order_estimate_days,
                'pre_order_deadline' => $product->pre_order_deadline?->toDateString(),
                'pre_order_min_quantity' => $product->pre_order_min_quantity,
                'pre_order_note' => $product->pre_order_note,
                'image' => $product->image,
                'seller' => $product->seller ? [
                    'id' => $product->seller->id,
                    'name' => $product->seller->name,
                ] : null,
                'owner' => $this->detailOwnerPayload($product),
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'pickup_place' => $pickupPlace ? [
                    'id' => $pickupPlace->id,
                    'name' => $pickupPlace->name,
                ] : null,
                'review_summary' => $reviewSummary,
                'sold_count' => $soldCount,
                'is_wishlisted' => $isWishlisted,
            ],
        ]);
    }

    /**
     * @return array{id: int|null, name: string|null, type: string|null}
     */
    private function detailOwnerPayload(Product $product): array
    {
        return $this->buyerOwnerPayload($product);
    }
}
