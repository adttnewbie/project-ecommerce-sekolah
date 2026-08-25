<?php

namespace App\Listeners;

use App\Events\ReviewPendingModeration;
use App\Support\NotificationDispatch;

class AdminReviewModerationNotify
{
    /**
     * Handle the event.
     */
    public function handle(ReviewPendingModeration $event): void
    {
        NotificationDispatch::toRole(
            'admin',
            'review',
            $event->notificationKey(),
            [
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'href' => route('admin.reviews.index', absolute: false),
                'data' => [
                    'review_id' => $event->reviewId,
                    'source' => 'review_pending_moderation',
                ],
            ],
        );
    }
}
