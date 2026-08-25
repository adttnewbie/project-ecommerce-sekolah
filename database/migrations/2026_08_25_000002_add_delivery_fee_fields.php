<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedTinyInteger('delivery_fee_rate')->nullable()->after('total_price');
            $table->unsignedBigInteger('delivery_fee')->default(0)->after('delivery_fee_rate');
        });

        Schema::table('up_jurusan_stock_movements', function (Blueprint $table) {
            $table->foreignId('up_jurusan_id')
                ->nullable()
                ->after('up_jurusan_consignment_id')
                ->constrained('up_jurusans')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('up_jurusan_stock_movements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('up_jurusan_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_fee_rate', 'delivery_fee']);
        });
    }
};
