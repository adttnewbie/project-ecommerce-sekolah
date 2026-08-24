<?php

namespace App\Support;

use App\Enums\ProductStatus;
use App\Enums\UpJurusanConsignmentStatus;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ConsignmentTransitionService
{
    /**
     * pending_approval → approved
     */
    public static function approve(UpJurusanConsignment $consignment, int $commissionRate, ?User $actor = null): void
    {
        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        self::assertCanTransition($current, UpJurusanConsignmentStatus::Approved);
        self::assertCommissionRate($commissionRate);

        // Two-stage moderation: the product itself must already be published
        // through the admin product-moderation gate before a jurusan approval
        // may run. Approving here would otherwise bypass that review.
        if ($current->product()->value('status') !== ProductStatus::Approved) {
            throw ValidationException::withMessages([
                'status' => 'Produk belum disetujui moderator. Setujui produk melalui moderasi terlebih dahulu, lalu setujui konsinyasanya.',
            ]);
        }

        $from = $current->status;

        $current->update([
            'status' => UpJurusanConsignmentStatus::Approved,
            'commission_rate' => $commissionRate,
        ]);
        $current->product()->update([
            'status' => ProductStatus::Approved,
            'rejection_reason' => null,
        ]);

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $current->id,
            'consignment_approved',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => UpJurusanConsignmentStatus::Approved->value,
            ],
        );
    }

    /**
     * pending_approval → rejected
     */
    public static function reject(UpJurusanConsignment $consignment, string $reason, ?User $actor = null): void
    {
        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        self::assertCanTransition($current, UpJurusanConsignmentStatus::Rejected);

        if ($current->sold_quantity > 0) {
            throw ValidationException::withMessages([
                'status' => 'Konsinyasi yang sudah terjual tidak dapat ditolak.',
            ]);
        }

        $from = $current->status;

        $current->update([
            'status' => UpJurusanConsignmentStatus::Rejected,
            'note' => $reason,
        ]);
        $current->product()->update([
            'status' => ProductStatus::Rejected,
            'rejection_reason' => $reason,
        ]);

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $current->id,
            'consignment_rejected',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => UpJurusanConsignmentStatus::Rejected->value,
            ],
        );
    }

    /**
     * approved → cancelled (no stock received/sold)
     */
    public static function cancel(UpJurusanConsignment $consignment, ?string $reason = null, ?User $actor = null): void
    {
        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        self::assertCanTransition($current, UpJurusanConsignmentStatus::Cancelled);

        if ($current->sold_quantity > 0) {
            throw ValidationException::withMessages([
                'status' => 'Konsinyasi yang sudah terjual tidak dapat dibatalkan.',
            ]);
        }

        if ($current->received_quantity > 0) {
            throw ValidationException::withMessages([
                'status' => 'Konsinyasi yang sudah diterima tidak dapat dibatalkan.',
            ]);
        }

        $from = $current->status;

        $current->update([
            'status' => UpJurusanConsignmentStatus::Cancelled,
            'note' => $reason ?? $current->note,
        ]);

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $current->id,
            'consignment_cancelled',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => UpJurusanConsignmentStatus::Cancelled->value,
            ],
        );
    }

    /**
     * approved|received → received (partial receive allowed).
     * Creates stock movement type=in.
     */
    public static function receive(UpJurusanConsignment $consignment, int $quantity, User $actor): void
    {
        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        if ($quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah diterima minimal 1.',
            ]);
        }

        if (! self::canReceive($current)) {
            throw ValidationException::withMessages([
                'quantity' => 'Barang hanya bisa diterima setelah request disetujui dan belum terminal.',
            ]);
        }

        $nextQuantity = $current->received_quantity + $quantity;

        if ($nextQuantity > $current->requested_quantity) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah diterima tidak boleh melebihi jumlah request.',
            ]);
        }

        $from = $current->status;

        $current->update([
            'received_quantity' => $nextQuantity,
            'status' => UpJurusanConsignmentStatus::Received,
        ]);

        UpJurusanStockMovement::query()->create([
            'up_jurusan_consignment_id' => $current->id,
            'user_id' => $actor->id,
            'type' => 'in',
            'quantity' => $quantity,
        ]);

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $current->id,
            'consignment_received',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => UpJurusanConsignmentStatus::Received->value,
                'quantity' => $quantity,
            ],
        );
    }

    /**
     * received → completed (domain: fully sold, received > 0)
     */
    public static function complete(UpJurusanConsignment $consignment, ?User $actor = null): void
    {
        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        self::assertCanTransition($current, UpJurusanConsignmentStatus::Completed);

        if ($current->received_quantity <= 0) {
            throw ValidationException::withMessages([
                'status' => 'Konsinyasi belum diterima, tidak dapat diselesaikan.',
            ]);
        }

        if ($current->sold_quantity < $current->received_quantity) {
            throw ValidationException::withMessages([
                'status' => 'Konsinyasi hanya selesai jika seluruh stok diterima sudah terjual.',
            ]);
        }

        self::assertInvariants($current);

        $from = $current->status;

        $current->update([
            'status' => UpJurusanConsignmentStatus::Completed,
        ]);

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $current->id,
            'consignment_completed',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => UpJurusanConsignmentStatus::Completed->value,
            ],
        );
    }

    /**
     * Record consignment sale quantity; auto-complete when sold >= received.
     * Does not create stock movements (caller owns movement rows).
     */
    public static function recordSold(UpJurusanConsignment $consignment, int $quantity, ?User $actor = null): void
    {
        if ($quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah penjualan minimal 1.',
            ]);
        }

        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        if (! in_array($current->status, [
            UpJurusanConsignmentStatus::Received,
            UpJurusanConsignmentStatus::Completed,
        ], true)) {
            throw ValidationException::withMessages([
                'quantity' => 'Penjualan hanya dari konsinyasi yang sudah diterima.',
            ]);
        }

        $available = $current->received_quantity - $current->sold_quantity;

        if ($quantity > $available) {
            throw ValidationException::withMessages([
                'quantity' => 'Jumlah keluar tidak boleh melebihi stok titipan tersedia.',
            ]);
        }

        $from = $current->status;
        $newSold = $current->sold_quantity + $quantity;
        $status = $newSold >= $current->received_quantity
            ? UpJurusanConsignmentStatus::Completed
            : UpJurusanConsignmentStatus::Received;

        $current->update([
            'sold_quantity' => $newSold,
            'status' => $status,
        ]);

        self::assertInvariants($current);

        // Real stock for consigned products is derived from sold/received
        // quantities, so a sale can push it below the threshold.
        $consignmentProduct = $current->product()->first();

        if ($consignmentProduct !== null) {
            $consignmentProduct->dispatchLowStockNotificationIfReached();
        }

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $current->id,
            'consignment_sale_recorded',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => $status->value,
                'quantity' => $quantity,
            ],
        );
    }

    /**
     * Restore sold quantity after reverse/cancel order; reopen to received when needed.
     */
    public static function restoreSold(UpJurusanConsignment $consignment, int $quantity, ?User $actor = null): void
    {
        if ($quantity < 1) {
            return;
        }

        /** @var UpJurusanConsignment $current */
        $current = UpJurusanConsignment::query()
            ->lockForUpdate()
            ->findOrFail($consignment->id);

        if (in_array($current->status, [
            UpJurusanConsignmentStatus::Rejected,
            UpJurusanConsignmentStatus::Cancelled,
            UpJurusanConsignmentStatus::PendingApproval,
            UpJurusanConsignmentStatus::Approved,
        ], true) && $current->received_quantity <= 0) {
            throw ValidationException::withMessages([
                'status' => 'Tidak dapat merestorasi penjualan pada status konsinyasi ini.',
            ]);
        }

        $from = $current->status;
        $newSold = max(0, $current->sold_quantity - $quantity);
        $status = $newSold >= $current->received_quantity && $current->received_quantity > 0
            ? UpJurusanConsignmentStatus::Completed
            : ($current->received_quantity > 0
                ? UpJurusanConsignmentStatus::Received
                : $current->status);

        $current->update([
            'sold_quantity' => $newSold,
            'status' => $status,
        ]);

        self::assertInvariants($consignment->fresh() ?? $consignment);

        DomainEventService::record(
            DomainEventService::AGGREGATE_CONSIGNMENT,
            $consignment->id,
            'consignment_sale_restored',
            $actor,
            [
                'from_status' => $from->value,
                'to_status' => $status->value,
                'quantity' => $quantity,
            ],
        );
    }

    public static function canReceive(UpJurusanConsignment $consignment): bool
    {
        return in_array($consignment->status, [
            UpJurusanConsignmentStatus::Approved,
            UpJurusanConsignmentStatus::Received,
        ], true);
    }

    public static function isTerminal(UpJurusanConsignmentStatus $status): bool
    {
        return match ($status) {
            UpJurusanConsignmentStatus::Completed,
            UpJurusanConsignmentStatus::Cancelled,
            UpJurusanConsignmentStatus::Rejected => true,
            default => false,
        };
    }

    /**
     * @return list<UpJurusanConsignmentStatus>
     */
    public static function allowedTargets(UpJurusanConsignmentStatus $from): array
    {
        return match ($from) {
            UpJurusanConsignmentStatus::PendingApproval => [
                UpJurusanConsignmentStatus::Approved,
                UpJurusanConsignmentStatus::Rejected,
            ],
            UpJurusanConsignmentStatus::Approved => [
                UpJurusanConsignmentStatus::Received,
                UpJurusanConsignmentStatus::Cancelled,
            ],
            UpJurusanConsignmentStatus::Received => [
                UpJurusanConsignmentStatus::Received,
                UpJurusanConsignmentStatus::Completed,
            ],
            UpJurusanConsignmentStatus::Completed,
            UpJurusanConsignmentStatus::Cancelled,
            UpJurusanConsignmentStatus::Rejected => [],
        };
    }

    public static function canTransition(
        UpJurusanConsignmentStatus $from,
        UpJurusanConsignmentStatus $to,
    ): bool {
        return in_array($to, self::allowedTargets($from), true);
    }

    public static function assertCanTransition(
        UpJurusanConsignment $consignment,
        UpJurusanConsignmentStatus $to,
    ): void {
        if (! self::canTransition($consignment->status, $to)) {
            throw ValidationException::withMessages([
                'status' => sprintf(
                    'Transisi status konsinyasi dari %s ke %s tidak diizinkan.',
                    $consignment->status->value,
                    $to->value,
                ),
            ]);
        }
    }

    public static function assertInvariants(UpJurusanConsignment $consignment): void
    {
        if ($consignment->received_quantity > $consignment->requested_quantity) {
            throw ValidationException::withMessages([
                'received_quantity' => 'Jumlah diterima tidak boleh melebihi jumlah request.',
            ]);
        }

        if ($consignment->sold_quantity > $consignment->received_quantity) {
            throw ValidationException::withMessages([
                'sold_quantity' => 'Jumlah terjual tidak boleh melebihi jumlah diterima.',
            ]);
        }

        if (
            $consignment->status === UpJurusanConsignmentStatus::Completed
            && ($consignment->received_quantity <= 0 || $consignment->sold_quantity < $consignment->received_quantity)
        ) {
            throw ValidationException::withMessages([
                'status' => 'Status selesai tidak valid untuk kuantitas konsinyasi ini.',
            ]);
        }
    }

    private static function assertCommissionRate(int $commissionRate): void
    {
        if ($commissionRate < 0 || $commissionRate > 100) {
            throw ValidationException::withMessages([
                'commission_rate' => 'Komisi harus antara 0 dan 100.',
            ]);
        }
    }
}
