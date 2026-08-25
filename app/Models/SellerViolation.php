<?php

namespace App\Models;

use App\Enums\SellerViolationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property SellerViolationType $type
 * @property int $points
 * @property string|null $description
 * @property int|null $order_id
 * @property int|null $product_id
 * @property Carbon $occurred_at
 * @property User $user
 * @property Order|null $order
 * @property Product|null $product
 */
#[Fillable(['user_id', 'type', 'points', 'description', 'order_id', 'product_id', 'occurred_at'])]
class SellerViolation extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SellerViolationType::class,
            'points' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
