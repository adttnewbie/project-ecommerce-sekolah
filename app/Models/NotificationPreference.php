<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'in_app_enabled',
        'email_enabled',
    ];

    protected $casts = [
        'in_app_enabled' => 'boolean',
        'email_enabled' => 'boolean',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Whether in-app notifications of a type may be delivered to the user.
     * Absence of a preference row means opted-in (default enabled).
     */
    public static function allowsInApp(int $userId, string $type): bool
    {
        return ! static::query()
            ->where('user_id', $userId)
            ->where('type', $type)
            ->where('in_app_enabled', false)
            ->exists();
    }
}
