<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PostgreSQL stores uuid columns as 16-byte UUIDs and rejects any other
     * string, while notification keys are prefixed identifiers such as
     * "order-pending:{orderId}:{sellerId}". Widen the column to a plain
     * string before the production switch to PostgreSQL.
     */
    public function up(): void
    {
        // Drop the unique index first: SQLite's table rebuild for ->change()
        // would otherwise collide with the still-registered index name.
        Schema::table('notifications', function (Blueprint $table): void {
            $table->dropUnique('notifications_key_unique');
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->string('key', 100)->change();
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->unique('key');
        });
    }

    /**
     * Restoring the uuid type is only possible while every stored key is a
     * valid UUID; prefixed keys written after this migration make the
     * rollback impossible by design.
     */
    public function down(): void {}
};
