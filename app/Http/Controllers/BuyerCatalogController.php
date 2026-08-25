<?php

namespace App\Http\Controllers;

use App\Enums\OrderItemStatus;
use App\Enums\ProductFulfillmentType;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Traits\OwnerPayloadHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerCatalogController extends Controller
{
    use OwnerPayloadHelper;

    public function __invoke(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $category = $category === 'all' ? '' : $category;
        $user = $request->user();

        return Inertia::render('catalog/index', [
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
            'categories' => Category::query()
                ->whereHas('products', fn ($query) => $query
                    ->where('status', ProductStatus::Approved)
                    ->where(fn ($query) => $query
                        ->where('fulfillment_type', ProductFulfillmentType::PreOrder)
                        ->orWhere('stock', '>', 0)
                        ->orWhereHas('upJurusanConsignments', fn ($query) => $query->whereColumn('received_quantity', '>', 'sold_quantity'))))
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ])
                ->all(),
            'products' => Product::query()
                ->with(['category:id,name,slug', 'seller:id,name', 'upJurusan:id,name'])
                ->with('upJurusanConsignments:id,product_id,received_quantity,sold_quantity')
                ->withSum(['orderItems as sold_count' => fn (Builder $q) => $q->where('status', OrderItemStatus::Completed)], 'quantity')
                ->withCount(['reviews as review_count'])
                ->withAvg(['reviews as review_avg' => fn (Builder $q) => $q], 'rating')
                ->when($user, fn (Builder $q) => $q->withExists(['wishlists as is_wishlisted' => fn (Builder $qq) => $qq->where('user_id', $user->id)]))
                ->where('status', ProductStatus::Approved)
                ->where(fn ($query) => $query
                    ->where('fulfillment_type', ProductFulfillmentType::PreOrder)
                    ->orWhere('stock', '>', 0)
                    ->orWhereHas('upJurusanConsignments', fn ($query) => $query->whereColumn('received_quantity', '>', 'sold_quantity')))
                ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                }))
                ->when($category !== '', fn ($query) => $query->whereHas(
                    'category',
                    fn ($query) => $query->where('slug', $category),
                ))
                ->latest()
                ->paginate(12)
                ->withQueryString()
                ->through(function (Product $product) use ($user): array {
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
                        'owner' => $this->catalogOwnerPayload($product),
                        'category' => [
                            'id' => $product->category->id,
                            'name' => $product->category->name,
                            'slug' => $product->category->slug,
                        ],
                        'review_summary' => $reviewSummary,
                        'sold_count' => $soldCount,
                        'is_wishlisted' => $isWishlisted,
                    ];
                }),
        ]);
    }

    /**
     * @return array{id: int|null, name: string|null, type: string|null}
     */
    private function catalogOwnerPayload(Product $product): array
    {
        return $this->buyerOwnerPayload($product);
    }
}
