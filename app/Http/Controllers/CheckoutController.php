<?php

namespace App\Http\Controllers;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductStatus;
use App\Enums\StockMovementSource;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use App\Support\ConsignmentTransitionService;
use App\Support\MoneyCalculationService;
use App\Support\OrderItemCancellation;
use App\Support\PreOrderRules;
use App\Support\TransactionCode;
use App\Traits\OwnerPayloadHelper;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CheckoutController extends Controller
{
    use OwnerPayloadHelper;

    private const MAX_UNPAID_ORDERS = 5;

    public function confirm(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $selectedIds = $this->selectedCartItemIds($request);
        $items = $request->query('product')
            ? collect([$this->buyNowItemPayload($request)])
            : CartItem::query()
                ->with([
                    'product.category:id,name,slug',
                    'product.seller:id,name',
                    'product.upJurusan:id,name',
                    'product.upJurusanConsignments.upJurusan:id,name',
                ])
                ->where('user_id', $user->id)
                ->when($selectedIds !== [], fn ($query) => $query->whereIn('id', $selectedIds))
                ->latest()
                ->get()
                ->map(function (CartItem $cartItem) {
                    $invalidReasons = PreOrderRules::invalidReasons($cartItem->product, $cartItem->quantity);

                    return [
                        'id' => $cartItem->id,
                        'source' => 'cart',
                        'quantity' => $cartItem->quantity,
                        'subtotal' => $cartItem->quantity * $cartItem->product->price,
                        'is_valid' => $invalidReasons === [],
                        'invalid_reasons' => $invalidReasons,
                        'product' => $this->productPayload($cartItem->product),
                    ];
                })
                ->values();

        return Inertia::render('checkout/confirm', [
            'items' => $items->all(),
            'summary' => [
                'total_items' => $items->sum('quantity'),
                'total_price' => $items->sum('subtotal'),
                'has_invalid_items' => $items->contains(fn (array $item) => $item['is_valid'] === false),
            ],
        ]);
    }

    public function __invoke(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $selectedIds = $this->selectedCartItemIds($request);
        $request->merge([
            'pickup_method' => $request->input('pickup_method', 'pickup'),
            'payment_method' => $request->input('payment_method', PaymentMethod::Cash->value),
        ]);
        $validated = $request->validate([
            'pickup_method' => ['required', 'string', 'in:pickup,delivery'],
            'pickup_location' => ['required_if:pickup_method,delivery', 'nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'string', 'in:cash'],
            'buy_now_product_id' => ['nullable', 'integer', 'exists:products,id'],
            'buy_now_quantity' => ['required_with:buy_now_product_id', 'nullable', 'integer', 'min:1'],
        ]);

        $order = $this->createOrderWithRetry($user, $validated, $selectedIds);

        return to_route('orders.show', $order)->with('success', 'Pesanan berhasil dibuat.');
    }

    /**
     * Create the order inside a transaction, retrying when a concurrent
     * request wins the transaction-code race and the orders.code unique
     * index rejects the insert (SQLSTATE 23000). Each attempt runs in its own
     * transaction, so any partial work rolls back before the retry.
     *
     * @param  array<string, mixed>  $validated
     * @param  array<int, int>  $selectedIds
     */
    private function createOrderWithRetry(User $user, array $validated, array $selectedIds): Order
    {
        $maxAttempts = 3;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return DB::transaction(function () use ($user, $validated, $selectedIds) {
                    // Serialize concurrent checkouts for the same buyer by
                    // locking their user row; the unpaid-order limit is then
                    // checked inside the same transaction so two parallel
                    // requests can not both slip past the cap.
                    User::query()->whereKey($user->id)->lockForUpdate()->first();

                    $this->assertUnderUnpaidOrderLimit($user);

                    $order = Order::query()->create([
                        'code' => TransactionCode::unique(fn (string $code): bool => Order::query()->where('code', $code)->exists()),
                        'user_id' => $user->id,
                        'status' => OrderStatus::Open,
                        'payment_status' => PaymentStatus::Unpaid,
                        'payment_method' => PaymentMethod::Cash,
                        'total_price' => 0,
                        'pickup_method' => $validated['pickup_method'],
                        'pickup_location' => $validated['pickup_method'] === 'delivery'
                            ? $validated['pickup_location'] ?? null
                            : null,
                        'expires_at' => now()->addHours(OrderItemCancellation::UNPAID_EXPIRY_HOURS),
                    ]);

                    $totalPrice = 0;
                    $processedIds = [];

                    if (isset($validated['buy_now_product_id'])) {
                        $productId = (int) $validated['buy_now_product_id'];
                        $product = Product::query()
                            ->lockForUpdate()
                            ->find($productId);
                        if ($product === null) {
                            throw ValidationException::withMessages([
                                'cart' => 'Produk yang dipilih sudah tidak tersedia.',
                            ]);
                        }
                        $quantity = (int) $validated['buy_now_quantity'];

                        $totalPrice = $this->createOrderItem($order, $product, $quantity, $user);

                        $order->update(['total_price' => $totalPrice]);

                        return $order;
                    }

                        $cartItems = CartItem::query()
                            ->where('user_id', $user->id)
                            ->when($selectedIds !== [], fn ($query) => $query->whereIn('id', $selectedIds))
                            ->orderBy('id')
                            ->get();

                        if ($cartItems->isEmpty()) {
                            throw ValidationException::withMessages([
                                'cart' => 'Cart masih kosong.',
                            ]);
                        }

                        foreach ($cartItems as $cartItem) {
                            $product = Product::query()
                                ->lockForUpdate()
                                ->find($cartItem->product_id);
                            if ($product === null) {
                                throw ValidationException::withMessages([
                                    'cart' => 'Salah satu produk di keranjang sudah tidak tersedia. Silakan periksa kembali keranjang Anda.',
                                ]);
                            }

                            $totalPrice += $this->createOrderItem($order, $product, $cartItem->quantity, $user);
                            $processedIds[] = $cartItem->id;
                        }

                        $order->update([
                            'total_price' => $totalPrice,
                        ]);

                        CartItem::query()
                            ->where('user_id', $user->id)
                            ->whereIn('id', $processedIds)
                            ->delete();

                        return $order;
                });
            } catch (QueryException $exception) {
                if (! $this->isUniqueConstraintViolation($exception) || $attempt === $maxAttempts) {
                    throw $exception;
                }

                usleep(random_int(0, 60_000));
            }
        }

        throw new RuntimeException('Unable to create the order after retrying code collisions.');
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        return (string) $exception->getCode() === '23000';
    }

    private function assertUnderUnpaidOrderLimit(User $user): void
    {
        $openUnpaidCount = Order::query()
            ->where('user_id', $user->id)
            ->where('payment_status', PaymentStatus::Unpaid)
            ->whereNotIn('status', [
                OrderStatus::Cancelled->value,
                OrderStatus::Completed->value,
            ])
            ->count();

        if ($openUnpaidCount >= self::MAX_UNPAID_ORDERS) {
            throw ValidationException::withMessages([
                'cart' => 'Kamu sudah memiliki terlalu banyak pesanan yang belum dibayar. Selesaikan atau batalkan pesanan lama sebelum membuat yang baru.',
            ]);
        }
    }

    /**
     * @return array<int, int>
     */
    private function selectedCartItemIds(Request $request): array
    {
        $items = $request->has('selected_cart_item_ids')
            ? $request->input('selected_cart_item_ids', [])
            : $request->query('items', []);

        if (is_string($items)) {
            $items = explode(',', $items);
        }

        if (! is_array($items)) {
            return [];
        }

        return collect($items)
            ->map(fn ($item) => (int) $item)
            ->filter(fn (int $item) => $item > 0)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array{id: int, source: 'buy_now', quantity: int, subtotal: int, is_valid: bool, invalid_reasons: list<string>, product: array<string, mixed>}
     */
    private function buyNowItemPayload(Request $request): array
    {
        $product = Product::query()
            ->with([
                'category:id,name,slug',
                'seller:id,name',
                'upJurusan:id,name',
                'upJurusanConsignments.upJurusan:id,name',
            ])
            ->where('slug', $request->query('product'))
            ->firstOrFail();
        abort_unless($product->status === ProductStatus::Approved, 404);

        $quantity = max(1, (int) $request->integer('quantity', 1));
        $invalidReasons = PreOrderRules::invalidReasons($product, $quantity);

        return [
            'id' => $product->id,
            'source' => 'buy_now',
            'quantity' => $quantity,
            'subtotal' => $quantity * $product->price,
            'is_valid' => $invalidReasons === [],
            'invalid_reasons' => $invalidReasons,
            'product' => $this->productPayload($product),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function productPayload(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price' => $product->price,
            'stock' => $product->availableStock(),
            'is_pre_order' => $product->isPreOrder(),
            'pre_order_estimate_days' => $product->pre_order_estimate_days,
            'pre_order_deadline' => $product->pre_order_deadline?->toDateString(),
            'pre_order_min_quantity' => $product->pre_order_min_quantity,
            'pre_order_note' => $product->pre_order_note,
            'image' => $product->image,
            'seller' => $this->productOwnerPayload($product),
            'category' => [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ],
            'pickup_place' => $this->pickupPlacePayload($product),
        ];
    }

    /**
     * @return array{id: int, name: string}|null
     */
    private function pickupPlacePayload(Product $product): ?array
    {
        $pickupPlace = $product->upJurusanConsignments
            ->first()
            ?->upJurusan;

        return $pickupPlace ? [
            'id' => $pickupPlace->id,
            'name' => $pickupPlace->name,
        ] : null;
    }

    private function createOrderItem(Order $order, Product $product, int $quantity, User $actor): int
    {
        if ($product->status !== ProductStatus::Approved) {
            throw ValidationException::withMessages([
                'cart' => "Produk {$product->name} tidak tersedia untuk checkout.",
            ]);
        }

        if (! $product->isPreOrder() && $quantity > $product->availableStock()) {
            throw ValidationException::withMessages([
                'cart' => "Quantity {$product->name} melebihi stok tersedia.",
            ]);
        }

        PreOrderRules::assertPurchasableForCheckout($product, $quantity);

        $subtotal = $quantity * $product->price;

        OrderItem::query()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => $product->price,
            'quantity' => $quantity,
            'subtotal' => $subtotal,
            'status' => OrderItemStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'payment_method' => PaymentMethod::Cash,
            'is_pre_order' => $product->isPreOrder(),
            'pre_order_estimate_days' => $product->isPreOrder() ? $product->pre_order_estimate_days : null,
            'pre_order_deadline' => $product->isPreOrder() ? $product->pre_order_deadline?->toDateString() : null,
            'pre_order_min_quantity' => $product->isPreOrder() ? $product->pre_order_min_quantity : null,
            'pre_order_note' => $product->isPreOrder() ? $product->pre_order_note : null,
        ]);

        if ($product->isPreOrder()) {
            return $subtotal;
        }

        if ($product->usesConsignmentStock()) {
            $this->recordConsignmentSale($order, $product, $actor, $quantity);
        } else {
            $product->update([
                'stock' => $product->stock - $quantity,
            ]);

            if ($product->seller_id === null && $product->up_jurusan_id !== null) {
                $money = MoneyCalculationService::upOwnedProductSaleSplit((int) $product->price, $quantity);

                UpJurusanStockMovement::query()->create([
                    'up_jurusan_consignment_id' => null,
                    'product_id' => $product->id,
                    'order_id' => $order->id,
                    'user_id' => $actor->id,
                    'type' => 'out',
                    'source' => StockMovementSource::OnlineOrder,
                    'quantity' => $quantity,
                    ...$money,
                ]);
            }
        }

        return $subtotal;
    }

    private function recordConsignmentSale(Order $order, Product $product, User $actor, int $quantity): void
    {
        $remaining = $quantity;
        $consignments = UpJurusanConsignment::query()
            ->where('product_id', $product->id)
            ->whereColumn('received_quantity', '>', 'sold_quantity')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        foreach ($consignments as $consignment) {
            if ($remaining <= 0) {
                return;
            }

            $available = $consignment->received_quantity - $consignment->sold_quantity;
            $sold = min($remaining, $available);
            $money = MoneyCalculationService::consignmentSaleSplit(
                (int) $product->price,
                $sold,
                (int) ($consignment->commission_rate ?? 0),
            );

            ConsignmentTransitionService::recordSold($consignment, $sold);
            UpJurusanStockMovement::query()->create([
                'up_jurusan_consignment_id' => $consignment->id,
                'product_id' => null,
                'order_id' => $order->id,
                'user_id' => $actor->id,
                'type' => 'out',
                'source' => StockMovementSource::OnlineOrder,
                'quantity' => $sold,
                ...$money,
            ]);

            $remaining -= $sold;
        }

        if ($remaining > 0) {
            throw ValidationException::withMessages([
                'cart' => "Quantity {$product->name} melebihi stok tersedia.",
            ]);
        }
    }

    /**
     * @return array{id: int|null, name: string|null}
     */
    private function productOwnerPayload(Product $product): array
    {
        return $this->sellerOwnerPayload($product);
    }
}
