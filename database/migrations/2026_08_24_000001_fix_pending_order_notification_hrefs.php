<?php

use App\Support\NotificationHrefBackfill;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Repair pending-order notification hrefs that were persisted with an
     * Order id against the OrderItem-bound seller route.
     */
    public function up(): void
    {
        NotificationHrefBackfill::run();
    }

    /**
     * Data repair cannot be reversed; restored hrefs would reintroduce dead links.
     */
    public function down(): void {}
};
