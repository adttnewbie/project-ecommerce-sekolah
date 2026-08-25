<?php

namespace App\Support;

use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use App\Enums\SellerViolationType;
use App\Enums\UserRole;
use App\Events\SanctionIssued;
use App\Events\SanctionLifted;
use App\Models\Order;
use App\Models\Product;
use App\Models\Sanction;
use App\Models\SellerViolation;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SellerSanctionService
{
    /**
     * Record a seller violation and evaluate automatic warnings.
     *
     * Safe to call inside an existing DB transaction. Order-linked violations
     * are deduplicated per order so retried or raced hooks never double-count;
     * moderation violations are deduplicated per product.
     */
    public static function recordViolation(
        int $sellerId,
        SellerViolationType $type,
        ?Order $order = null,
        ?Product $product = null,
        ?string $description = null,
        ?CarbonInterface $occurredAt = null,
    ): ?SellerViolation {
        return DB::transaction(function () use ($sellerId, $type, $order, $product, $description, $occurredAt) {
            if ($order !== null && $type !== SellerViolationType::ProductModerationRejected) {
                $alreadyRecorded = SellerViolation::query()
                    ->where('user_id', $sellerId)
                    ->where('type', $type->value)
                    ->where('order_id', $order->id)
                    ->exists();

                if ($alreadyRecorded) {
                    return null;
                }
            }

            if ($product !== null && $type === SellerViolationType::ProductModerationRejected) {
                $alreadyRecorded = SellerViolation::query()
                    ->where('user_id', $sellerId)
                    ->where('type', $type->value)
                    ->where('product_id', $product->id)
                    ->exists();

                if ($alreadyRecorded) {
                    return null;
                }
            }

            $violation = SellerViolation::query()->create([
                'user_id' => $sellerId,
                'type' => $type->value,
                'points' => $type->defaultPoints(),
                'description' => $description,
                'order_id' => $order?->id,
                'product_id' => $product?->id,
                'occurred_at' => $occurredAt ?? now(),
            ]);

            self::evaluateAutoWarning($sellerId);

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

        if ($target->role !== UserRole::Seller) {
            throw ValidationException::withMessages([
                'sanction' => 'Sanksi penjual hanya dapat diberikan kepada seller.',
            ]);
        }

        if ($type === SanctionType::Warning) {
            throw ValidationException::withMessages([
                'sanction' => 'Peringatan diberikan otomatis oleh sistem.',
            ]);
        }

        if (! in_array($type, [SanctionType::ListingBan, SanctionType::SellingSuspension, SanctionType::PermanentBan], true)) {
            throw ValidationException::withMessages([
                'sanction' => "Sanksi {$type->label()} hanya berlaku untuk buyer.",
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
                    'sanction' => "Sanksi {$type->label()} sudah aktif untuk seller ini.",
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
                ],
            ]);

            SanctionIssued::dispatch(
                sanctionId: (int) $sanction->id,
                userId: (int) $sanction->user_id,
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
                userId: (int) $current->user_id,
                type: $current->type,
            );
        });
    }

    /**
     * The seller's most severe currently-active sanction that blocks product listing.
     */
    public static function activeListingBlocker(User $user): ?Sanction
    {
        return self::activeBlocker($user, fn (SanctionType $type) => $type->blocksListing());
    }

    /**
     * The seller's most severe currently-active sanction that blocks selling
     * (products hidden from the buyer catalog).
     */
    public static function activeSellingBlocker(User $user): ?Sanction
    {
        return self::activeBlocker($user, fn (SanctionType $type) => $type->blocksSelling());
    }

    /**
     * IDs of sellers whose products must be hidden from the buyer catalog.
     *
     * @return array<int, int>
     */
    public static function suspendedSellerIds(): array
    {
        return Sanction::query()
            ->where('status', SanctionStatus::Active->value)
            ->where(fn ($query) => $query
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>', now()))
            ->get(['user_id', 'type'])
            ->filter(fn (Sanction $sanction) => $sanction->type->blocksSelling())
            ->map(fn (Sanction $sanction) => (int) $sanction->user_id)
            ->unique()
            ->values()
            ->all();
    }

    public static function isSellerSuspended(int $sellerId): bool
    {
        return in_array($sellerId, self::suspendedSellerIds(), true);
    }

    private static function activeBlocker(User $user, callable $blocks): ?Sanction
    {
        $sanctions = Sanction::query()
            ->where('user_id', $user->id)
            ->where('status', SanctionStatus::Active->value)
            ->where(fn ($query) => $query
                ->whereNull('ends_at')
                ->orWhere('ends_at', '>', now()))
            ->get()
            ->filter(fn (Sanction $sanction) => $blocks($sanction->type));

        return $sanctions->sortByDesc(
            fn (Sanction $sanction) => [$sanction->type->severity(), $sanction->id],
        )->first();
    }

    private static function evaluateAutoWarning(int $sellerId, ?CarbonInterface $now = null): void
    {
        $now ??= now();
        $windowStart = SanctionSettings::sellerWindowStart($now);

        $alreadyWarnedThisWindow = Sanction::query()
            ->where('user_id', $sellerId)
            ->where('type', SanctionType::Warning->value)
            ->where('issued_by', null)
            ->where('starts_at', '>=', $windowStart)
            ->exists();

        if ($alreadyWarnedThisWindow) {
            return;
        }

        $points = self::windowPoints($sellerId, $now);

        if ($points < SanctionSettings::sellerWarningPoints()) {
            return;
        }

        /** @var Sanction $warning */
        $warning = Sanction::query()->create([
            'user_id' => $sellerId,
            'type' => SanctionType::Warning->value,
            'reason' => "Akumulasi {$points} poin pelanggaran dalam ".SanctionSettings::sellerWindowDays().' hari terakhir',
            'issued_by' => null,
            'status' => SanctionStatus::Active->value,
            'starts_at' => $now,
            'metadata' => [
                'violation_points_window' => $points,
                'trigger' => 'points_threshold',
            ],
        ]);

        SanctionIssued::dispatch(
            sanctionId: (int) $warning->id,
            userId: (int) $warning->user_id,
            type: $warning->type,
            reason: $warning->reason,
        );
    }

    private static function windowPoints(int $userId, ?CarbonInterface $now = null): int
    {
        return (int) SellerViolation::query()
            ->where('user_id', $userId)
            ->where('occurred_at', '>=', SanctionSettings::sellerWindowStart($now))
            ->sum('points');
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
