<?php

namespace App\Models;

use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property SanctionType $type
 * @property string|null $reason
 * @property int|null $issued_by
 * @property SanctionStatus $status
 * @property Carbon $starts_at
 * @property Carbon|null $ends_at
 * @property int|null $lifted_by
 * @property Carbon|null $lifted_at
 * @property array<string, mixed>|null $metadata
 * @property User $user
 * @property User|null $issuer
 * @property User|null $lifter
 */
#[Fillable([
    'user_id', 'type', 'reason', 'issued_by', 'status',
    'starts_at', 'ends_at', 'lifted_by', 'lifted_at', 'metadata',
])]
class Sanction extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SanctionType::class,
            'status' => SanctionStatus::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'lifted_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function isActive(): bool
    {
        return $this->status === SanctionStatus::Active
            && ($this->ends_at === null || $this->ends_at->isFuture());
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function lifter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lifted_by');
    }
}
