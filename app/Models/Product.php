<?php

namespace App\Models;

use App\Enums\ProductFulfillmentType;
use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property int|null $seller_id
 * @property int|null $up_jurusan_id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property int $price
 * @property int $stock
 * @property ProductSalesMethod $sales_method
 * @property ProductFulfillmentType $fulfillment_type
 * @property int|null $pre_order_estimate_days
 * @property Carbon|null $pre_order_deadline
 * @property int|null $pre_order_min_quantity
 * @property string|null $pre_order_note
 * @property ProductStatus $status
 * @property string|null $rejection_reason
 * @property string|null $image
 * @property User|null $seller
 * @property UpJurusan|null $upJurusan
 * @property Category $category
 */
#[Fillable(['seller_id', 'up_jurusan_id', 'category_id', 'name', 'slug', 'description', 'price', 'stock', 'sales_method', 'fulfillment_type', 'pre_order_estimate_days', 'pre_order_deadline', 'pre_order_min_quantity', 'pre_order_note', 'status', 'rejection_reason', 'image'])]
class Product extends Model
{
    public const int LOW_STOCK_THRESHOLD = 5;

    public const string REAL_STOCK_SQL = "(CASE WHEN products.sales_method = 'up_jurusan' AND products.seller_id IS NOT NULL THEN (SELECT COALESCE(SUM(received_quantity - sold_quantity), 0) FROM up_jurusan_consignments WHERE up_jurusan_consignments.product_id = products.id) ELSE products.stock END)";

    public const string REAL_STOCK_EXPRESSION = "(CASE WHEN products.sales_method = 'up_jurusan' AND products.seller_id IS NOT NULL THEN COALESCE(consignment_stock.available, 0) ELSE products.stock END)";

    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'stock' => 'integer',
            'sales_method' => ProductSalesMethod::class,
            'fulfillment_type' => ProductFulfillmentType::class,
            'pre_order_estimate_days' => 'integer',
            'pre_order_deadline' => 'date',
            'pre_order_min_quantity' => 'integer',
            'status' => ProductStatus::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * @return BelongsTo<UpJurusan, $this>
     */
    public function upJurusan(): BelongsTo
    {
        return $this->belongsTo(UpJurusan::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<CartItem, $this>
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasMany<UpJurusanConsignment, $this>
     */
    public function upJurusanConsignments(): HasMany
    {
        return $this->hasMany(UpJurusanConsignment::class);
    }

    public function usesConsignmentStock(): bool
    {
        return $this->sales_method === ProductSalesMethod::UpJurusan && $this->seller_id !== null;
    }

    public function isPreOrder(): bool
    {
        return $this->fulfillment_type === ProductFulfillmentType::PreOrder;
    }

    public function availableStock(): int
    {
        if (! $this->usesConsignmentStock()) {
            return $this->stock;
        }

        if ($this->relationLoaded('upJurusanConsignments')) {
            return (int) $this->upJurusanConsignments->reduce(
                fn (int $carry, UpJurusanConsignment $consignment): int => $carry + $consignment->received_quantity - $consignment->sold_quantity,
                0,
            );
        }

        return (int) $this->upJurusanConsignments()
            ->selectRaw('COALESCE(SUM(received_quantity - sold_quantity), 0) as available')
            ->value('available');
    }

    public static function realStockSql(): string
    {
        return self::REAL_STOCK_SQL;
    }

    /**
     * Owner payload used by buyer-facing catalog/detail surfaces. Priority is
     * given to the UP Jurusan (consignment/pickup owner) over the seller.
     *
     * @return array{id: int|null, name: string|null, type: string|null}
     */
    public function ownerPayload(): array
    {
        if ($this->upJurusan) {
            return [
                'id' => $this->upJurusan->id,
                'name' => $this->upJurusan->name,
                'type' => 'up_jurusan',
            ];
        }

        if ($this->seller) {
            return [
                'id' => $this->seller->id,
                'name' => $this->seller->name,
                'type' => 'seller',
            ];
        }

        return ['id' => null, 'name' => null, 'type' => null];
    }

    /**
     * Seller payload used by order/checkout/cart surfaces. Priority is given
     * to the seller over the UP Jurusan.
     *
     * @return array{id: int|null, name: string|null}
     */
    public function sellerPayload(): array
    {
        if ($this->seller) {
            return ['id' => $this->seller->id, 'name' => $this->seller->name];
        }

        if ($this->upJurusan) {
            return ['id' => $this->upJurusan->id, 'name' => $this->upJurusan->name];
        }

        return ['id' => null, 'name' => null];
    }

    /**
     * Scope that computes each product's real stock via a single left join to a
     * pre-aggregated consignment subquery, exposing it as the "real_stock" column.
     *
     * Replaces the per-row correlated subquery (REAL_STOCK_SQL) used in
     * selectRaw/whereRaw/orderByRaw so the aggregation runs once instead of once
     * per product row.
     *
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeWithRealStock(Builder $query): Builder
    {
        return $query
            ->select('products.*')
            ->selectRaw(self::REAL_STOCK_EXPRESSION.' as real_stock')
            ->leftJoin(
                DB::raw('(SELECT product_id, SUM(received_quantity - sold_quantity) AS available FROM up_jurusan_consignments GROUP BY product_id) AS consignment_stock'),
                'consignment_stock.product_id',
                '=',
                'products.id',
            );
    }
}
