<?php

namespace App\Http\Controllers;

use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Events\ProductModerationDecided;
use App\Http\Requests\Admin\RejectProductRequest;
use App\Models\Product;
use App\Support\DomainEventService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $products = Product::query()
            ->with(['category:id,name,slug', 'seller:id,name,email'])
            ->where('status', ProductStatus::Pending)
            ->where('sales_method', ProductSalesMethod::SelfManaged)
            ->whereNotNull('seller_id')
            ->oldest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/products/moderation', [
            'products' => $products->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'submitted_at' => $product->created_at?->diffForHumans() ?? '-',
                'seller' => [
                    'id' => $product->seller->id,
                    'name' => $product->seller->name,
                    'email' => $product->seller->email,
                ],
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
            ]),
        ]);
    }

    public function approve(Request $request, Product $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product) {
            $affected = Product::query()
                ->whereKey($product->id)
                ->where('status', ProductStatus::Pending)
                ->where('sales_method', ProductSalesMethod::SelfManaged)
                ->update([
                    'status' => ProductStatus::Approved,
                    'rejection_reason' => null,
                ]);

            abort_unless($affected === 1, 404);

            DomainEventService::record(
                DomainEventService::AGGREGATE_PRODUCT,
                $product->id,
                'product_approved',
                $request->user(),
                ['to_status' => ProductStatus::Approved->value],
            );

            ProductModerationDecided::dispatch(
                productId: $product->id,
                productName: $product->name,
                sellerId: (int) $product->seller_id,
                decision: 'approved',
            );
        });

        return back();
    }

    public function reject(RejectProductRequest $request, Product $product): RedirectResponse
    {
        $reason = trim($request->string('reason')->toString());

        DB::transaction(function () use ($request, $product, $reason) {
            $affected = Product::query()
                ->whereKey($product->id)
                ->where('status', ProductStatus::Pending)
                ->where('sales_method', ProductSalesMethod::SelfManaged)
                ->update([
                    'status' => ProductStatus::Rejected,
                    'rejection_reason' => $reason,
                ]);

            abort_unless($affected === 1, 404);

            DomainEventService::record(
                DomainEventService::AGGREGATE_PRODUCT,
                $product->id,
                'product_rejected',
                $request->user(),
                [
                    'to_status' => ProductStatus::Rejected->value,
                    'reason' => $reason,
                ],
            );

            ProductModerationDecided::dispatch(
                productId: $product->id,
                productName: $product->name,
                sellerId: (int) $product->seller_id,
                decision: 'rejected',
                reason: $reason !== '' ? $reason : null,
            );
        });

        return back();
    }
}
