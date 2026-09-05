<?php

namespace App\Support;

use App\Enums\OrderItemStatus;
use App\Models\Product;
use App\Models\User;
use App\Traits\OwnerPayloadHelper;
use Illuminate\Database\Eloquent\Builder;

class CatalogProductPayload
{
    use OwnerPayloadHelper;

    /**
     * Eager loads + aggregates shared by every buyer product card.
     *
     * @param  Builder<Product>  $query
     */
    public function cardRelations(Builder $query, ?User $user): void
    {
        $query
            ->with(['category:id,name,slug', 'seller:id,name', 'upJurusan:id,name'])
            ->with('upJurusanConsignments:id,product_id,received_quantity,sold_quantity')
            ->withSum(['orderItems as sold_count' => fn (Builder $q) => $q->where('status', OrderItemStatus::Completed)], 'quantity')
            ->withCount(['reviews as review_count'])
            ->withAvg(['reviews as review_avg' => fn (Builder $q) => $q], 'rating')
            ->when($user, fn (Builder $q) => $q->withExists(['wishlists as is_wishlisted' => fn (Builder $qq) => $qq->where('user_id', $user->id)]));
    }

    /**
     * @return array<string, mixed>
     */
    public function map(Product $product, ?User $user): array
    {
        $reviewCount = (int) ($product->getAttribute('review_count') ?? 0);
        $reviewAvg = $product->getAttribute('review_avg');
        $soldCountRaw = $product->getAttribute('sold_count');
        $originalPrice = $product->original_price;

        $reviewSummary = null;
        if ($reviewCount > 0 && $reviewAvg !== null) {
            $reviewSummary = [
                'average' => round((float) $reviewAvg, 1),
                'count' => $reviewCount,
            ];
        }

        $soldCount = null;
        if ($soldCountRaw !== null && (int) $soldCountRaw > 0) {
            $soldCount = (int) $soldCountRaw;
        }

        $isWishlisted = false;
        if ($user) {
            $isWishlisted = (bool) ($product->getAttribute('is_wishlisted') ?? false);
        }

        $showOriginal = $originalPrice !== null && $originalPrice > $product->price;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => $product->price,
            'original_price' => $showOriginal ? $originalPrice : null,
            'stock' => $product->availableStock(),
            'is_pre_order' => $product->isPreOrder(),
            'fulfillment_type' => [
                'code' => $product->fulfillment_type->value,
                'label' => $product->fulfillment_type->label(),
            ],
            'pre_order_estimate_days' => $product->pre_order_estimate_days,
            'pre_order_deadline' => $product->pre_order_deadline?->toDateString(),
            'pre_order_status' => $product->preOrderStatus()?->value,
            'pre_order_min_quantity' => $product->pre_order_min_quantity,
            'pre_order_note' => $product->pre_order_note,
            'image' => $product->image,
            'seller' => $product->seller ? [
                'id' => $product->seller->id,
                'name' => $product->seller->name,
            ] : null,
            'owner' => $this->buyerOwnerPayload($product),
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ],
            'review_summary' => $reviewSummary,
            'sold_count' => $soldCount,
            'is_wishlisted' => $isWishlisted,
        ];
    }
}
