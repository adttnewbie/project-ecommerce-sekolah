<?php

namespace App\Http\Controllers;

use App\Enums\ProductFulfillmentType;
use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Enums\UpJurusanConsignmentStatus;
use App\Events\OrderItemStatusChanged;
use App\Events\ProductPendingModeration;
use App\Http\Requests\Seller\StoreProductRequest;
use App\Http\Requests\Seller\UpdateProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SellerProductController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $seller */
        $seller = $request->user();

        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::enum(ProductStatus::class)],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'stock' => ['nullable', Rule::in(['all', 'low', 'out'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Product::query()
            ->select('products.*')
            ->selectRaw(Product::REAL_STOCK_SQL.' as real_stock')
            ->with('category:id,name,slug')
            ->where('seller_id', $seller->id);

        if ($search = $validated['q'] ?? null) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($status = $validated['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($categoryId = $validated['category_id'] ?? null) {
            $query->where('category_id', $categoryId);
        }

        if ($stock = $validated['stock'] ?? null) {
            match ($stock) {
                'out' => $query->whereRaw(Product::REAL_STOCK_SQL.' = 0'),
                'low' => $query
                    ->whereRaw(Product::REAL_STOCK_SQL.' > 0')
                    ->whereRaw(Product::REAL_STOCK_SQL.' <= ?', [Product::LOW_STOCK_THRESHOLD]),
                default => null,
            };
        }

        $perPage = 10;

        $products = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('seller/products/index', [
            'products' => $products->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ],
                'price' => $product->price,
                'stock' => (int) $product->getAttribute('real_stock'),
                'is_pre_order' => $product->isPreOrder(),
                'fulfillment_type' => [
                    'code' => $product->fulfillment_type->value,
                    'label' => $product->fulfillment_type->label(),
                ],
                'pre_order_estimate_days' => $product->pre_order_estimate_days,
                'pre_order_deadline' => $product->pre_order_deadline?->toDateString(),
                'pre_order_min_quantity' => $product->pre_order_min_quantity,
                'status' => [
                    'code' => $product->status->value,
                    'label' => $product->status->label(),
                ],
            ]),
            'categories' => $this->categoryOptions(),
            'filters' => [
                'q' => $validated['q'] ?? '',
                'status' => $validated['status'] ?? '',
                'category_id' => $validated['category_id'] ?? '',
                'stock' => $validated['stock'] ?? '',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('seller/products/create', [
            'categories' => $this->categoryOptions(),
            'upJurusans' => $this->upJurusanOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        /** @var User $seller */
        $seller = $request->user();
        $imagePath = null;
        $newImagePath = null;
        $image = $request->file('image');

        if ($image instanceof UploadedFile) {
            $storedImage = $image->store('products', 'r2');
            $imagePath = $storedImage === false ? null : $storedImage;
            $newImagePath = $imagePath;
        }

        $salesMethod = ProductSalesMethod::from(
            $request->input('sales_method', ProductSalesMethod::SelfManaged->value),
        );
        $fulfillmentType = ProductFulfillmentType::from(
            $request->input('fulfillment_type', ProductFulfillmentType::ReadyStock->value),
        );
        $requestedStatus = $salesMethod === ProductSalesMethod::UpJurusan
            ? ProductStatus::Pending
            : ProductStatus::from($request->input('status', ProductStatus::Pending->value));

        $createdProductId = null;
        $moderationDispatched = false;

        try {
            DB::transaction(function () use ($request, $seller, $imagePath, $salesMethod, $fulfillmentType, $requestedStatus, &$createdProductId, &$moderationDispatched) {
                $product = Product::query()->create([
                    'seller_id' => $seller->id,
                    'category_id' => $request->integer('category_id'),
                    'name' => $request->string('name')->toString(),
                    'slug' => $this->uniqueSlug($request->string('name')->toString()),
                    'description' => $request->string('description')->toString(),
                    'price' => $request->integer('price'),
                    'original_price' => $request->filled('original_price')
                        ? $request->integer('original_price')
                        : null,
                    'stock' => $salesMethod === ProductSalesMethod::UpJurusan ? 0 : $request->integer('stock'),
                    'sales_method' => $salesMethod,
                    'fulfillment_type' => $fulfillmentType,
                    'pre_order_estimate_days' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $request->integer('pre_order_estimate_days')
                        : null,
                    'pre_order_deadline' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $request->date('pre_order_deadline')?->toDateString()
                        : null,
                    'pre_order_min_quantity' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $request->integer('pre_order_min_quantity') ?: null
                        : null,
                    'pre_order_note' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $request->string('pre_order_note')->trim()->toString() ?: null
                        : null,
                    'status' => $requestedStatus,
                    'image' => $imagePath,
                ]);

                $createdProductId = $product->id;

                if (
                    $salesMethod === ProductSalesMethod::UpJurusan
                    && $fulfillmentType === ProductFulfillmentType::ReadyStock
                    && $requestedStatus === ProductStatus::Pending
                ) {
                    $consignment = UpJurusanConsignment::query()->create([
                        'seller_id' => $seller->id,
                        'product_id' => $product->id,
                        'up_jurusan_id' => $request->integer('up_jurusan_id'),
                        'requested_quantity' => $request->integer('requested_quantity'),
                        'status' => UpJurusanConsignmentStatus::PendingApproval,
                    ]);

                    OrderItemStatusChanged::dispatch(
                        orderItemId: null,
                        orderId: null,
                        productId: $product->id,
                        consignmentId: $consignment->id,
                        productName: $request->string('name')->toString(),
                        sellerName: $seller->name,
                        buyerName: $seller->name,
                        action: 'pengajuan titip barang baru menunggu persetujuan',
                        picketId: null,
                        consignmentStatus: UpJurusanConsignmentStatus::PendingApproval->value,
                    );
                }

                if ($salesMethod === ProductSalesMethod::UpJurusan && $fulfillmentType === ProductFulfillmentType::ReadyStock && $requestedStatus === ProductStatus::Pending) {
                    ProductPendingModeration::dispatch(
                        productId: $product->id,
                        productName: $request->string('name')->toString(),
                        sellerId: $seller->id,
                        sellerName: $seller->name
                    );
                    $moderationDispatched = true;
                }
            });
        } catch (\Throwable $exception) {
            // The file was stored before the transaction; remove it so a
            // failed insert does not leave an orphaned upload behind.
            if ($newImagePath !== null) {
                Storage::disk('r2')->delete($newImagePath);
            }

            throw $exception;
        }

        // Dispatch SETELAH transaksi sukses untuk setiap produk yang berakhir
        // Pending dan belum di-dispatch di dalam transaksi. Aturan per
        // kombinasi: SelfManaged + Pending (ReadyStock maupun PreOrder)
        // di-dispatch di sini; UpJurusan + ReadyStock + Pending sudah
        // di-dispatch di dalam transaksi (flag di atas mencegah dobel);
        // UpJurusan + PreOrder + Pending tidak dicakup blok konsinyasi
        // maupun blok moderasi in-tx sehingga di-dispatch di sini.
        if (
            $requestedStatus === ProductStatus::Pending
            && $createdProductId !== null
            && ! $moderationDispatched
        ) {
            ProductPendingModeration::dispatch(
                productId: $createdProductId,
                productName: $request->string('name')->toString(),
                sellerId: $seller->id,
                sellerName: $seller->name
            );
        }

        return to_route('seller.products.index');
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->authorizeOwner($request, $product);
        $product->load('category:id,name,slug');

        return Inertia::render('seller/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_id' => $product->category_id,
                'description' => $product->description,
                'price' => $product->price,
                'original_price' => $product->original_price,
                'stock' => $product->stock,
                'fulfillment_type' => [
                    'code' => $product->fulfillment_type->value,
                    'label' => $product->fulfillment_type->label(),
                ],
                'pre_order_estimate_days' => $product->pre_order_estimate_days,
                'pre_order_deadline' => $product->pre_order_deadline?->toDateString(),
                'pre_order_min_quantity' => $product->pre_order_min_quantity,
                'pre_order_note' => $product->pre_order_note,
                'image' => $product->image,
                'status' => [
                    'code' => $product->status->value,
                    'label' => $product->status->label(),
                ],
            ],
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorizeOwner($request, $product);
        $oldImagePath = $product->image;
        $imagePath = $product->image;
        $newImagePath = null;
        $image = $request->file('image');

        if ($image instanceof UploadedFile) {
            $storedImage = $image->store('products', 'r2');
            if ($storedImage !== false) {
                $imagePath = $storedImage;
                $newImagePath = $storedImage;
            }
        }

        $requestedStatus = ProductStatus::from(
            $request->input('status', $product->status->value),
        );
        $oldStatus = $product->status;
        $newStatus = $this->nextStatusAfterSellerUpdate($product, $requestedStatus);

        try {
            $product->update([
                'category_id' => $request->integer('category_id'),
                'name' => $request->string('name')->toString(),
                'slug' => $this->uniqueSlug($request->string('name')->toString(), $product),
                'description' => $request->string('description')->toString(),
                'price' => $request->integer('price'),
                'original_price' => $request->filled('original_price')
                    ? $request->integer('original_price')
                    : null,
                'fulfillment_type' => ProductFulfillmentType::from($request->input('fulfillment_type', ProductFulfillmentType::ReadyStock->value)),
                'pre_order_estimate_days' => $request->input('fulfillment_type', ProductFulfillmentType::ReadyStock->value) === ProductFulfillmentType::PreOrder->value
                    ? $request->integer('pre_order_estimate_days')
                    : null,
                'pre_order_deadline' => $request->input('fulfillment_type', ProductFulfillmentType::ReadyStock->value) === ProductFulfillmentType::PreOrder->value
                    ? $request->date('pre_order_deadline')?->toDateString()
                    : null,
                'pre_order_min_quantity' => $request->input('fulfillment_type', ProductFulfillmentType::ReadyStock->value) === ProductFulfillmentType::PreOrder->value
                    ? $request->integer('pre_order_min_quantity') ?: null
                    : null,
                'pre_order_note' => $request->input('fulfillment_type', ProductFulfillmentType::ReadyStock->value) === ProductFulfillmentType::PreOrder->value
                    ? $request->string('pre_order_note')->trim()->toString() ?: null
                    : null,
                'status' => $newStatus,
                'image' => $imagePath,
            ]);
        } catch (\Throwable $exception) {
            // A newly stored replacement must not outlive a failed update.
            if ($newImagePath !== null) {
                Storage::disk('r2')->delete($newImagePath);
            }

            throw $exception;
        }

        if ($oldImagePath && $imagePath !== $oldImagePath) {
            $this->deleteProductImage($oldImagePath);
        }

        // Dispatch SETELAH update sukses: hanya saat transisi ke Pending
        // (lama != Pending, baru == Pending). Key format dijaga
        // listener/event: admin-product-moderation:{id} (admin) dan
        // admin-product-pending:{id} (seller).
        if ($oldStatus !== ProductStatus::Pending && $newStatus === ProductStatus::Pending) {
            /** @var User $seller */
            $seller = $request->user();

            ProductPendingModeration::dispatch(
                productId: $product->id,
                productName: $product->name,
                sellerId: $seller->id,
                sellerName: $seller->name
            );
        }

        return to_route('seller.products.index');
    }

    private function nextStatusAfterSellerUpdate(Product $product, ProductStatus $requestedStatus): ProductStatus
    {
        if ($product->status === ProductStatus::Draft) {
            return $requestedStatus === ProductStatus::Pending
                ? ProductStatus::Pending
                : ProductStatus::Draft;
        }

        if ($product->status === ProductStatus::Approved && $product->sales_method === ProductSalesMethod::SelfManaged) {
            return ProductStatus::Pending;
        }

        return $product->status;
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeOwner($request, $product);

        if ($product->orderItems()->exists()) {
            throw ValidationException::withMessages([
                'product' => 'Produk tidak dapat dihapus karena sudah memiliki riwayat pesanan.',
            ])->redirectTo(route('seller.products.index'));
        }

        if ($product->image) {
            $this->deleteProductImage($product->image);
        }

        $product->delete();

        return to_route('seller.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * @return array<int, array{id: int, name: string, slug: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{id: int, name: string}>
     */
    private function upJurusanOptions(): array
    {
        return UpJurusan::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (UpJurusan $upJurusan) => [
                'id' => $upJurusan->id,
                'name' => $upJurusan->name,
            ])
            ->values()
            ->all();
    }

    private function authorizeOwner(Request $request, Product $product): void
    {
        /** @var User $seller */
        $seller = $request->user();

        abort_unless($product->seller_id === $seller->id, 403);
    }

    /**
     * Hapus gambar dari disk R2; gambar lama yang masih di disk lokal
     * ikut dibersihkan. Menghapus file yang tidak ada adalah no-op.
     */
    private function deleteProductImage(string $path): void
    {
        Storage::disk('r2')->delete($path);
        Storage::disk('public')->delete($path);
    }

    private function uniqueSlug(string $name, ?Product $ignoredProduct = null): string
    {
        $baseSlug = Str::slug($name) ?: 'product';
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->slugExists($slug, $ignoredProduct)) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?Product $ignoredProduct = null): bool
    {
        return Product::query()
            ->where('slug', $slug)
            ->when(
                $ignoredProduct,
                fn ($query) => $query->whereKeyNot($ignoredProduct->getKey()),
            )
            ->exists();
    }
}
