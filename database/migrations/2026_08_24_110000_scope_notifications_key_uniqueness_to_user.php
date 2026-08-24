<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The same notification key must be deliverable to multiple recipients
     * (e.g. every admin, or each seller of a multi-seller order). Uniqueness
     * therefore belongs to the (user_id, key) pair, not the key alone.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table): void {
            $table->dropUnique('notifications_key_unique');
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->unique(['user_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table): void {
            $table->dropUnique('notifications_user_id_key_unique');
        });

        Schema::table('notifications', function (Blueprint $table): void {
            $table->unique('key');
        });
    }
};
