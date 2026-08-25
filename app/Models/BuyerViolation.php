<?php

namespace App\Models;

use App\Enums\BuyerViolationType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property BuyerViolationType $type
 * @property int $points
 * @property string|null $description
 * @property int|null $order_id
 * @property int|null $review_id
 * @property Carbon $occurred_at
 * @property User $user
 * @property Order|null $order
 * @property Review|null $review
 */
#[Fillable(['user_id', 'type', 'points', 'description', 'order_id', 'review_id', 'occurred_at'])]
class BuyerViolation extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => BuyerViolationType::class,
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
     * @return BelongsTo<Review, $this>
     */
    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
