<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wa_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('template_key', 64)->index();
            $table->string('to', 32)->index();
            $table->json('payload')->nullable();
            $table->string('status', 16)->default('pending')->index();
            $table->string('wuzapi_msg_id', 128)->nullable()->index();
            $table->text('error')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wa_notification_logs');
    }
};
