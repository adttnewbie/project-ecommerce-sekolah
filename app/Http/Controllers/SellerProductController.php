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
use App\Models\UpJurusanPayout;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use App\Support\ProductSlug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
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
            $escaped = addcslashes($search, '%_\\');
            $query->where(function ($q) use ($escaped) {
                $q->where('name', 'like', "%{$escaped}%")
                    ->orWhere('slug', 'like', "%{$escaped}%");
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
        $validated = $request->validated();
        $imagePath = null;
        $newImagePath = null;
        $image = $request->file('image');

        if ($image instanceof UploadedFile) {
            $storedImage = $image->store('products', 'r2');
            $imagePath = $storedImage === false ? null : $storedImage;
            $newImagePath = $imagePath;
        }

        $salesMethod = ProductSalesMethod::from(
            $validated['sales_method'] ?? ProductSalesMethod::SelfManaged->value,
        );
        $fulfillmentType = ProductFulfillmentType::from(
            $validated['fulfillment_type'] ?? ProductFulfillmentType::ReadyStock->value,
        );

        if ($salesMethod === ProductSalesMethod::UpJurusan && $fulfillmentType === ProductFulfillmentType::PreOrder) {
            throw ValidationException::withMessages([
                'fulfillment_type' => 'Produk titipan UP Jurusan tidak mendukung pre-order.',
            ]);
        }

        $requestedStatus = $salesMethod === ProductSalesMethod::UpJurusan
            ? ProductStatus::Pending
            : ProductStatus::from($validated['status'] ?? ProductStatus::Pending->value);

        $productName = (string) ($validated['name'] ?? '');
        $categoryId = (int) ($validated['category_id'] ?? 0);
        $description = (string) ($validated['description'] ?? '');
        $price = (int) ($validated['price'] ?? 0);
        $originalPrice = isset($validated['original_price'])
            ? (int) $validated['original_price']
            : null;
        $stock = (int) ($validated['stock'] ?? 0);
        $upJurusanId = isset($validated['up_jurusan_id']) ? (int) $validated['up_jurusan_id'] : 0;
        $requestedQuantity = (int) ($validated['requested_quantity'] ?? 0);
        $preOrderEstimateDays = isset($validated['pre_order_estimate_days']) ? (int) $validated['pre_order_estimate_days'] : 0;
        $preOrderDeadline = ! empty($validated['pre_order_deadline'])
            ? Carbon::parse($validated['pre_order_deadline'])->toDateString()
            : null;
        $preOrderMinQuantity = isset($validated['pre_order_min_quantity'])
            ? (int) $validated['pre_order_min_quantity']
            : null;
        $preOrderNote = isset($validated['pre_order_note']) && trim((string) $validated['pre_order_note']) !== ''
            ? trim((string) $validated['pre_order_note'])
            : null;

        $createdProductId = null;
        $moderationDispatched = false;
        // UpJurusan+PreOrder ditolak di atas, jadi alur titipan selalu ReadyStock.
        $createsConsignment = $salesMethod === ProductSalesMethod::UpJurusan
            && $requestedStatus === ProductStatus::Pending;

        try {
            DB::transaction(function () use ($seller, $imagePath, $salesMethod, $fulfillmentType, $requestedStatus, $createsConsignment, $productName, $categoryId, $description, $price, $originalPrice, $stock, $upJurusanId, $requestedQuantity, $preOrderEstimateDays, $preOrderDeadline, $preOrderMinQuantity, $preOrderNote, &$createdProductId, &$moderationDispatched) {
                $product = Product::query()->create([
                    'seller_id' => $seller->id,
                    'category_id' => $categoryId,
                    'name' => $productName,
                    'slug' => ProductSlug::unique($productName),
                    'description' => $description,
                    'price' => $price,
                    'original_price' => $originalPrice,
                    'stock' => $salesMethod === ProductSalesMethod::UpJurusan ? 0 : $stock,
                    'sales_method' => $salesMethod,
                    'fulfillment_type' => $fulfillmentType,
                    'pre_order_estimate_days' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $preOrderEstimateDays
                        : null,
                    'pre_order_deadline' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $preOrderDeadline
                        : null,
                    'pre_order_min_quantity' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $preOrderMinQuantity
                        : null,
                    'pre_order_note' => $fulfillmentType === ProductFulfillmentType::PreOrder
                        ? $preOrderNote
                        : null,
                    'status' => $requestedStatus,
                    'image' => $imagePath,
                ]);

                $createdProductId = $product->id;

                if ($createsConsignment) {
                    $consignment = UpJurusanConsignment::query()->create([
                        'seller_id' => $seller->id,
                        'product_id' => $product->id,
                        'up_jurusan_id' => $upJurusanId,
                        'requested_quantity' => $requestedQuantity,
                        'status' => UpJurusanConsignmentStatus::PendingApproval,
                    ]);

                    OrderItemStatusChanged::dispatch(
                        orderItemId: null,
                        orderId: null,
                        productId: $product->id,
                        consignmentId: $consignment->id,
                        productName: $productName,
                        sellerName: $seller->name,
                        buyerName: $seller->name,
                        action: 'pengajuan titip barang baru menunggu persetujuan',
                        picketId: null,
                        consignmentStatus: UpJurusanConsignmentStatus::PendingApproval->value,
                    );
                }

                if ($createsConsignment) {
                    ProductPendingModeration::dispatch(
                        productId: $product->id,
                        productName: $productName,
                        sellerId: $seller->id,
                        sellerName: $seller->name
                    );
                    $moderationDispatched = true;
                }
            });
        } catch (\Throwable $exception) {
            // The file was stored before the transaction; remove it so a
            // failed insert does not leave an orphaned upload behind.
            if ($newImagePath !== null && Storage::disk('r2')->delete($newImagePath) === false) {
                Log::warning('Failed to delete orphaned product image after failed store', [
                    'path' => $newImagePath,
                ]);
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
                productName: $productName,
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
        $validated = $request->validated();
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

        $fulfillmentType = ProductFulfillmentType::from(
            $validated['fulfillment_type'] ?? ProductFulfillmentType::ReadyStock->value,
        );

        if ($product->sales_method === ProductSalesMethod::UpJurusan && $fulfillmentType === ProductFulfillmentType::PreOrder) {
            throw ValidationException::withMessages([
                'fulfillment_type' => 'Produk titipan UP Jurusan tidak mendukung pre-order.',
            ]);
        }

        $requestedStatus = ProductStatus::from(
            $validated['status'] ?? $product->status->value,
        );
        $oldStatus = $product->status;
        $newStatus = $this->nextStatusAfterSellerUpdate($product, $requestedStatus);

        $productName = (string) ($validated['name'] ?? $product->name);
        $isPreOrder = $fulfillmentType === ProductFulfillmentType::PreOrder;

        try {
            $product->update([
                'category_id' => (int) ($validated['category_id'] ?? $product->category_id),
                'name' => $productName,
                'slug' => ProductSlug::unique($productName, $product),
                'description' => (string) ($validated['description'] ?? $product->description),
                'price' => (int) ($validated['price'] ?? $product->price),
                'original_price' => isset($validated['original_price'])
                    ? (int) $validated['original_price']
                    : null,
                'fulfillment_type' => $fulfillmentType,
                'pre_order_estimate_days' => $isPreOrder
                    ? (int) ($validated['pre_order_estimate_days'] ?? 0)
                    : null,
                'pre_order_deadline' => $isPreOrder && ! empty($validated['pre_order_deadline'])
                    ? Carbon::parse($validated['pre_order_deadline'])->toDateString()
                    : null,
                'pre_order_min_quantity' => $isPreOrder && isset($validated['pre_order_min_quantity'])
                    ? (int) $validated['pre_order_min_quantity']
                    : null,
                'pre_order_note' => $isPreOrder && isset($validated['pre_order_note']) && trim((string) $validated['pre_order_note']) !== ''
                    ? trim((string) $validated['pre_order_note'])
                    : null,
                'status' => $newStatus,
                'image' => $imagePath,
            ]);
        } catch (\Throwable $exception) {
            // A newly stored replacement must not outlive a failed update.
            if ($newImagePath !== null && Storage::disk('r2')->delete($newImagePath) === false) {
                Log::warning('Failed to delete replacement product image after failed update', [
                    'path' => $newImagePath,
                ]);
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

        // Ledger guards first: consignments, stock movements, and payouts are
        // ON DELETE RESTRICT, so refuse with a friendly 422 before the
        // database raises a QueryException. (cart_items and wishlists are
        // cascadeOnDelete, so they are removed automatically with the product
        // and need no guard here.)
        $consignmentIds = $product->upJurusanConsignments()->pluck('id');

        if ($consignmentIds->isNotEmpty()) {
            $hasPayout = UpJurusanPayout::query()
                ->whereIn('up_jurusan_consignment_id', $consignmentIds)
                ->exists();

            throw ValidationException::withMessages([
                'product' => $hasPayout
                    ? 'Produk tidak dapat dihapus karena sudah memiliki riwayat payout UP Jurusan.'
                    : 'Produk tidak dapat dihapus karena memiliki riwayat titipan UP Jurusan.',
            ])->redirectTo(route('seller.products.index'));
        }

        if (UpJurusanStockMovement::query()->where('product_id', $product->id)->exists()) {
            throw ValidationException::withMessages([
                'product' => 'Produk tidak dapat dihapus karena memiliki riwayat pergerakan stok UP Jurusan.',
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
        if (Storage::disk('r2')->delete($path) === false) {
            Log::warning('Failed to delete product image from r2', ['path' => $path]);
        }
        Storage::disk('public')->delete($path);
    }
}
