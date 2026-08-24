<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // order, stock, product, payment, system, promotion
            $table->uuid('key')->unique(); // Stable identity, never changes based on entity state
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('href');
            $table->json('data')->nullable(); // Optional payload for future extensibility
            $table->timestamp('read_at')->nullable();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            // Indexes for efficient queries
            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'dismissed_at']);
            $table->index(['user_id', 'type', 'read_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
