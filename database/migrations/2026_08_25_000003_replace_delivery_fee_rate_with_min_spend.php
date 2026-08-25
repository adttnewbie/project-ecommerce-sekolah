<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('delivery_fee_min_spend')
                ->nullable()
                ->after('delivery_fee');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('delivery_fee_rate');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedTinyInteger('delivery_fee_rate')
                ->nullable()
                ->after('total_price');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('delivery_fee_min_spend');
        });
    }
};
