<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'key',
        'title',
        'description',
        'href',
        'data',
        'read_at',
        'dismissed_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'read_at' => 'datetime',
        'dismissed_at' => 'datetime',
        'data' => 'array',
    ];

    /**
     * Generate a new notification with a stable key.
     *
     * @param  array<string, mixed>|null  $extraData
     */
    public static function createNotification(
        int $userId,
        string $type,
        string $stableKey, // Must be deterministic and unique per entity/event
        string $title,
        string $description,
        string $href,
        ?array $extraData = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'key' => $stableKey,
            'title' => $title,
            'description' => $description,
            'href' => $href,
            'data' => $extraData,
            'created_at' => now(),
        ]);
    }

    /**
     * Mark this notification as read.
     */
    public function markAsRead(): void
    {
        if ($this->read_at === null) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Check if notification is unread.
     */
    public function isUnread(): bool
    {
        return $this->read_at === null;
    }

    /**
     * Mark this notification as dismissed.
     */
    public function markAsDismissed(): void
    {
        if ($this->dismissed_at === null) {
            $this->update(['dismissed_at' => now()]);
        }
    }

    /**
     * Check if notification is dismissed.
     */
    public function isDismissed(): bool
    {
        return $this->dismissed_at !== null;
    }

    /**
     * Get user relationship.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for unread notifications only.
     */
    /** @param  Builder<Notification>  $query */
    public function scopeUnread(Builder $query): void
    {
        $query->whereNull('read_at');
    }

    /**
     * Scope for read notifications only.
     */
    /** @param  Builder<Notification>  $query */
    public function scopeRead(Builder $query): void
    {
        $query->whereNotNull('read_at');
    }

    /**
     * Scope for unread notifications of specific type.
     */
    /** @param  Builder<Notification>  $query */
    public function scopeUnreadOfType(Builder $query, string $type): void
    {
        $query->unread()->where('type', $type);
    }

    /**
     * Scope to exclude dismissed notifications.
     */
    /** @param  Builder<Notification>  $query */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('dismissed_at');
    }

    /**
     * Count unread notifications for a user.
     */
    public static function countUnreadForUser(int $userId): int
    {
        return static::where('user_id', $userId)
            ->unread()
            ->active()
            ->count();
    }

    /**
     * Create or retrieve by key (idempotent).
     */
    public static function createOrGetByKey(string $key, ?int &$notificationId): ?self
    {
        $notification = static::where('key', $key)->first();

        if ($notification) {
            $notificationId = $notification->id;

            return $notification;
        }

        return null;
    }
}
