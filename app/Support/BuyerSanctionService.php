<?php

namespace App\Support;

use App\Enums\BuyerViolationType;
use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use App\Enums\UserRole;
use App\Events\SanctionIssued;
use App\Events\SanctionLifted;
use App\Models\BuyerViolation;
use App\Models\Order;
use App\Models\Review;
use App\Models\Sanction;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BuyerSanctionService
{
    /**
     * Record a buyer violation and evaluate automatic warnings.
     *
     * Safe to call inside an existing DB transaction (uses savepoints when
     * nested). Order-linked violations are deduplicated per order so retried
     * or raced hooks never double-count.
     */
    public static function recordViolation(
        int $buyerId,
        BuyerViolationType $type,
        ?Order $order = null,
        ?Review $review = null,
        ?string $description = null,
        ?CarbonInterface $occurredAt = null,
    ): ?BuyerViolation {
        return DB::transaction(function () use ($buyerId, $type, $order, $review, $description, $occurredAt) {
            if ($order !== null && $type !== BuyerViolationType::ReviewRejected) {
                $alreadyRecorded = BuyerViolation::query()
                    ->where('user_id', $buyerId)
                    ->where('type', $type->value)
                    ->where('order_id', $order->id)
                    ->exists();

                if ($alreadyRecorded) {
                    return null;
                }
            }

            $violation = BuyerViolation::query()->create([
                'user_id' => $buyerId,
                'type' => $type->value,
                'points' => $type->defaultPoints(),
                'description' => $description,
                'order_id' => $order?->id,
                'review_id' => $review?->id,
                'occurred_at' => $occurredAt ?? now(),
            ]);

            self::evaluateAutoWarning($buyerId);

            return $violation;
        });
    }

    /**
     * Admin-issued sanction. Warnings are system-issued and cannot be created here.
     */
    public static function issueSanction(
        User $target,
        SanctionType $type,
        User $actor,
        ?string $reason = null,
        ?CarbonInterface $endsAt = null,
    ): Sanction {
        self::assertAdmin($actor);

        if ($target->role !== UserRole::Buyer) {
            throw ValidationException::withMessages([
                'sanction' => 'Sanksi hanya dapat diberikan kepada buyer.',
            ]);
        }

        if ($type === SanctionType::Warning) {
            throw ValidationException::withMessages([
                'sanction' => 'Peringatan diberikan otomatis oleh sistem.',
            ]);
        }

        return DB::transaction(function () use ($target, $type, $actor, $reason, $endsAt) {
            /** @var User $current */
            $current = User::query()->lockForUpdate()->findOrFail($target->id);

            $duplicate = Sanction::query()
                ->where('user_id', $current->id)
                ->where('type', $type->value)
                ->where('status', SanctionStatus::Active->value)
                ->exists();

            if ($duplicate) {
                throw ValidationException::withMessages([
                    'sanction' => "Sanksi {$type->label()} sudah aktif untuk buyer ini.",
                ]);
            }

            /** @var Sanction $sanction */
            $sanction = Sanction::query()->create([
                'user_id' => $current->id,
                'type' => $type->value,
                'reason' => $reason,
                'issued_by' => $actor->id,
                'status' => SanctionStatus::Active->value,
                'starts_at' => now(),
                // A ban without ends_at is indefinite until lifted; permanent bans are always open-ended.
                'ends_at' => $type === SanctionType::PermanentBan ? null : $endsAt,
                'metadata' => [
                    'violation_points_window' => self::windowPoints((int) $current->id),
                    'receipt_violations_window' => self::windowReceiptCount((int) $current->id),
                ],
            ]);

            SanctionIssued::dispatch(
                sanctionId: (int) $sanction->id,
                buyerId: (int) $sanction->user_id,
                type: $sanction->type,
                reason: $sanction->reason,
            );

            return $sanction;
        });
    }

    public static function lift(Sanction $sanction, User $actor): void
    {
        self::assertAdmin($actor);

        DB::transaction(function () use ($sanction, $actor) {
            /** @var Sanction $current */
            $current = Sanction::query()->lockForUpdate()->findOrFail($sanction->id);

            if ($current->status === SanctionStatus::Lifted) {
                throw ValidationException::withMessages([
                    'sanction' => 'Sanksi ini sudah dicabut.',
                ]);
            }

            $current->update([
                'status' => SanctionStatus::Lifted->value,
                'lifted_by' => $actor->id,
                'lifted_at' => now(),
            ]);

            SanctionLifted::dispatch(
                sanctionId: (int) $current->id,
                buyerId: (int) $current->user_id,
                type: $current->type,
            );
        });
    }

    /**
     * The buyer's most severe currently-active sanction that blocks checkout.
     */
    public static function activeCheckoutBlocker(User $user): ?Sanction
    {
        return self::activeBlocker($user, fn (SanctionType $type) => $type->blocksCheckout());
    }

    /**
     * The most severe currently-active sanction of any kind, warnings included.
     */
    public static function activeSanction(User $user): ?Sanction
    {
        return self::activeBlocker($user, fn (SanctionType $type) => true);
    }

    /**
     * The buyer's most severe currently-active sanction that blocks reviews.
     */
    public static function activeReviewBlocker(User $user): ?Sanction
    {
        return self::activeBlocker($user, fn (SanctionType $type) => $type->blocksReview());
    }

    private static function activeBlocker(User $user, callable $blocks): ?Sanction
    {
        $severity = [
            SanctionType::Warning->value => 0,
            SanctionType::ReviewBan->value => 1,
            SanctionType::CheckoutBan->value => 2,
            SanctionType::PermanentBan->value => 3,
        ];

        $sanctions = Sanction::query()
            ->where('user_id', $user->id)
            ->where('status', SanctionStatus::Active->value)
            ->where(fn ($query) => $query
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>', now()))
            ->get()
            ->filter(fn (Sanction $sanction) => $blocks($sanction->type));

        return $sanctions->sortByDesc(
            fn (Sanction $sanction) => [$severity[$sanction->type->value], $sanction->id],
        )->first();
    }

    private static function evaluateAutoWarning(int $buyerId, ?CarbonInterface $now = null): void
    {
        $now ??= now();
        $windowStart = SanctionSettings::windowStart($now);

        $alreadyWarnedThisWindow = Sanction::query()
            ->where('user_id', $buyerId)
            ->where('type', SanctionType::Warning->value)
            ->where('issued_by', null)
            ->where('starts_at', '>=', $windowStart)
            ->exists();

        if ($alreadyWarnedThisWindow) {
            return;
        }

        $points = self::windowPoints($buyerId, $now);
        $receiptCount = self::windowReceiptCount($buyerId, $now);

        $pointsTriggered = $points >= SanctionSettings::warningPoints();
        $receiptTriggered = $receiptCount >= SanctionSettings::receiptForceCompleteCount();

        if (! $pointsTriggered && ! $receiptTriggered) {
            return;
        }

        /** @var Sanction $warning */
        $warning = Sanction::query()->create([
            'user_id' => $buyerId,
            'type' => SanctionType::Warning->value,
            'reason' => $pointsTriggered
                ? "Akumulasi {$points} poin pelanggaran dalam ".SanctionSettings::windowDays().' hari terakhir'
                : "Pesanan yang diselesaikan paksa admin sebanyak {$receiptCount} kali dalam ".SanctionSettings::windowDays().' hari terakhir',
            'issued_by' => null,
            'status' => SanctionStatus::Active->value,
            'starts_at' => $now,
            'metadata' => [
                'violation_points_window' => $points,
                'receipt_violations_window' => $receiptCount,
                'trigger' => $pointsTriggered ? 'points_threshold' : 'receipt_threshold',
            ],
        ]);

        SanctionIssued::dispatch(
            sanctionId: (int) $warning->id,
            buyerId: (int) $warning->user_id,
            type: $warning->type,
            reason: $warning->reason,
        );
    }

    private static function windowPoints(int $userId, ?CarbonInterface $now = null): int
    {
        return (int) BuyerViolation::query()
            ->where('user_id', $userId)
            ->where('occurred_at', '>=', SanctionSettings::windowStart($now))
            ->sum('points');
    }

    private static function windowReceiptCount(int $userId, ?CarbonInterface $now = null): int
    {
        return BuyerViolation::query()
            ->where('user_id', $userId)
            ->where('type', BuyerViolationType::UnconfirmedReceipt->value)
            ->where('occurred_at', '>=', SanctionSettings::windowStart($now))
            ->count();
    }

    private static function assertAdmin(User $actor): void
    {
        if ($actor->role !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'sanction' => 'Hanya admin yang dapat mengelola sanksi.',
            ]);
        }
    }
}
