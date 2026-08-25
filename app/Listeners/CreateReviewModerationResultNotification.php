<?php

namespace App\Listeners;

use App\Events\ReviewModerationDecided;
use App\Support\NotificationDispatch;

class CreateReviewModerationResultNotification
{
    /**
     * Handle the event.
     */
    public function handle(ReviewModerationDecided $event): void
    {
        NotificationDispatch::toUser(
            $event->buyerId,
            'review',
            $event->notificationKey(),
            [
                'href' => route('catalog.show', ['product' => $event->productSlug], false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'review_id' => $event->reviewId,
                    'decision' => $event->decision,
                    'source' => 'review_moderation_decided',
                ],
            ],
        );
    }
}
