<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminNotificationTriggered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public readonly int $adminId,
        public readonly string $type,
        public readonly string $title,
        public readonly string $description,
        public readonly ?string $href = null,
        public readonly array $data = [],
    ) {}

    public function notificationKey(): string
    {
        return "admin-{$this->type}-{$this->adminId}-".md5($this->title);
    }
}
