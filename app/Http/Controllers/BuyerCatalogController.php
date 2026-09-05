<?php

namespace App\Http\Controllers;

use App\Enums\ProductFulfillmentType;
use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Support\CatalogProductPayload;
use App\Support\SellerSanctionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerCatalogController extends Controller
{
    public function __construct(private CatalogProductPayload $payload) {}

    public function __invoke(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $category = $category === 'all' ? '' : $category;
        $user = $request->user();
        $suspendedSellerIds = SellerSanctionService::suspendedSellerIds();

        return Inertia::render('catalog/index', [
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
            'categories' => Category::query()
                ->whereHas('products', fn ($query) => $query
                    ->where('status', ProductStatus::Approved)
                    ->where(fn ($query) => $query
                        ->whereNull('seller_id')
                        ->orWhereNotIn('seller_id', $suspendedSellerIds))
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
                ->tap(fn (Builder $q) => $this->payload->cardRelations($q, $user))
                ->where('status', ProductStatus::Approved)
                ->where(fn ($query) => $query
                    ->whereNull('seller_id')
                    ->orWhereNotIn('seller_id', $suspendedSellerIds))
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
                ->through(fn (Product $product): array => $this->payload->map($product, $user)),
        ]);
    }
}
