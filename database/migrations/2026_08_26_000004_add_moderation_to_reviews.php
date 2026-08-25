<?php

use App\Enums\ReviewStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->enum('status', ReviewStatus::values())
                ->default(ReviewStatus::Pending->value)
                ->index()
                ->after('rating');
            $table->text('rejection_reason')->nullable()->after('status');
        });

        // Reviews written before moderation existed were already public.
        DB::table('reviews')
            ->whereNull('rejection_reason')
            ->update(['status' => ReviewStatus::Approved->value]);
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['status', 'rejection_reason']);
        });
    }
};
