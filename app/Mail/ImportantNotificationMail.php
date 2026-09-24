<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Single generic email for important account events (payments, orders,
 * sanctions). Queued so web requests never wait for SMTP.
 */
class ImportantNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName,
        public readonly string $notificationTitle,
        public readonly string $notificationDescription,
        public readonly ?string $actionUrl = null,
        public readonly string $actionLabel = 'Lihat di EduCart',
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[EduCart] '.$this->notificationTitle,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.important-notification',
        );
    }
}
