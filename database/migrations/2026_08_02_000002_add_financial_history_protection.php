<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Replaces destructive ON DELETE CASCADE foreign keys with ON DELETE
     * RESTRICT / SET NULL so that financial history can never be wiped out
     * by deleting a parent record (user, order, consignment, UP Jurusan,
     * POS sale, or daily report).
     */
    public function up(): void
    {
        // Orders: a user who has ever placed an order is a financial record owner.
        $this->restrict('orders', 'user_id', 'users');

        // Order items are the financial detail of an order.
        $this->restrict('order_items', 'order_id', 'orders');

        // An admin who owns a UP Jurusan (and therefore its ledger) must not be deletable.
        $this->restrict('up_jurusans', 'admin_jurusan_id', 'users');

        // Consignment history is owned by the seller, the product, and the UP Jurusan.
        $this->restrict('up_jurusan_consignments', 'seller_id', 'users');
        $this->restrict('up_jurusan_consignments', 'product_id', 'products');
        $this->restrict('up_jurusan_consignments', 'up_jurusan_id', 'up_jurusans');

        // Stock movements are immutable ledger entries. Their consignment and
        // product links are optional, so severing the link keeps the entry.
        $this->detach('up_jurusan_stock_movements', 'up_jurusan_consignment_id', 'up_jurusan_consignments');
        $this->detach('up_jurusan_stock_movements', 'product_id', 'products');

        // The user who recorded a movement owns that part of the ledger.
        $this->restrict('up_jurusan_stock_movements', 'user_id', 'users');

        // Payouts are money already (or to be) paid out; they are immutable.
        $this->restrict('up_jurusan_payouts', 'up_jurusan_consignment_id', 'up_jurusan_consignments');
        $this->restrict('up_jurusan_payouts', 'seller_id', 'users');
        $this->restrict('up_jurusan_payouts', 'user_id', 'users');

        // POS sales and daily reports are submitted financial records.
        $this->restrict('up_jurusan_pos_sales', 'up_jurusan_id', 'up_jurusans');
        $this->restrict('up_jurusan_pos_sales', 'user_id', 'users');
        $this->restrict('up_jurusan_daily_reports', 'up_jurusan_id', 'up_jurusans');
        $this->restrict('up_jurusan_daily_reports', 'user_id', 'users');

        // Daily report snapshots are the permanent copy of a submitted report.
        $this->restrict(
            'up_jurusan_daily_report_transactions',
            'up_jurusan_daily_report_id',
            'up_jurusan_daily_reports',
            'up_report_tx_report_fk',
        );
        $this->restrict(
            'up_jurusan_daily_report_transaction_items',
            'up_jurusan_daily_report_transaction_id',
            'up_jurusan_daily_report_transactions',
            'up_report_item_tx_fk',
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $this->replaceConstraint('orders', 'user_id', 'users', 'cascade');
        $this->replaceConstraint('order_items', 'order_id', 'orders', 'cascade');
        $this->replaceConstraint('up_jurusans', 'admin_jurusan_id', 'users', 'cascade');
        $this->replaceConstraint('up_jurusan_consignments', 'seller_id', 'users', 'cascade');
        $this->replaceConstraint('up_jurusan_consignments', 'product_id', 'products', 'cascade');
        $this->replaceConstraint('up_jurusan_consignments', 'up_jurusan_id', 'up_jurusans', 'cascade');
        $this->replaceConstraint('up_jurusan_stock_movements', 'up_jurusan_consignment_id', 'up_jurusan_consignments', 'cascade');
        $this->replaceConstraint('up_jurusan_stock_movements', 'product_id', 'products', 'cascade');
        $this->replaceConstraint('up_jurusan_stock_movements', 'user_id', 'users', 'cascade');
        $this->replaceConstraint('up_jurusan_payouts', 'up_jurusan_consignment_id', 'up_jurusan_consignments', 'cascade');
        $this->replaceConstraint('up_jurusan_payouts', 'seller_id', 'users', 'cascade');
        $this->replaceConstraint('up_jurusan_payouts', 'user_id', 'users', 'cascade');
        $this->replaceConstraint('up_jurusan_pos_sales', 'up_jurusan_id', 'up_jurusans', 'cascade');
        $this->replaceConstraint('up_jurusan_pos_sales', 'user_id', 'users', 'cascade');
        $this->replaceConstraint('up_jurusan_daily_reports', 'up_jurusan_id', 'up_jurusans', 'cascade');
        $this->replaceConstraint('up_jurusan_daily_reports', 'user_id', 'users', 'cascade');
        $this->replaceConstraint(
            'up_jurusan_daily_report_transactions',
            'up_jurusan_daily_report_id',
            'up_jurusan_daily_reports',
            'cascade',
            'up_report_tx_report_fk',
        );
        $this->replaceConstraint(
            'up_jurusan_daily_report_transaction_items',
            'up_jurusan_daily_report_transaction_id',
            'up_jurusan_daily_report_transactions',
            'cascade',
            'up_report_item_tx_fk',
        );
    }

    /**
     * Re-point a foreign key to ON DELETE RESTRICT.
     */
    private function restrict(string $table, string $column, string $references, ?string $constraintName = null): void
    {
        $this->replaceConstraint($table, $column, $references, 'restrict', $constraintName);
    }

    /**
     * Re-point a foreign key to ON DELETE SET NULL.
     */
    private function detach(string $table, string $column, string $references, ?string $constraintName = null): void
    {
        $this->replaceConstraint($table, $column, $references, 'null', $constraintName);
    }

    /**
     * Drop the existing foreign key on $column and re-add it with the given
     * ON DELETE behaviour, keeping the original constraint name.
     */
    private function replaceConstraint(
        string $table,
        string $column,
        string $references,
        string $onDelete,
        ?string $constraintName = null,
    ): void {
        Schema::table($table, function (Blueprint $blueprint) use ($column, $constraintName) {
            // SQLite only supports dropping foreign keys by column (it rebuilds the
            // table); MySQL/PostgreSQL resolve the constraint by name, which is
            // required for the two explicitly named report snapshot constraints.
            $blueprint->dropForeign(DB::getDriverName() === 'sqlite'
                ? [$column]
                : ($constraintName ?? [$column]));
        });

        Schema::table($table, function (Blueprint $blueprint) use ($column, $references, $onDelete, $constraintName) {
            $foreign = $blueprint->foreign($column, $constraintName)
                ->references('id')
                ->on($references);

            if ($onDelete === 'null') {
                $foreign->nullOnDelete();
            } elseif ($onDelete === 'cascade') {
                $foreign->cascadeOnDelete();
            } else {
                $foreign->restrictOnDelete();
            }
        });
    }
};
