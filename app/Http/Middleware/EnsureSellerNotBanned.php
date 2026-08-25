<?php

namespace App\Http\Middleware;

use App\Enums\SanctionType;
use App\Enums\UserRole;
use App\Models\Sanction;
use App\Models\User;
use App\Support\SellerSanctionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerNotBanned
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $scope = 'listing'): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null || $user->role !== UserRole::Seller) {
            return $next($request);
        }

        $blocker = $scope === 'selling'
            ? SellerSanctionService::activeSellingBlocker($user)
            : SellerSanctionService::activeListingBlocker($user);

        if ($blocker === null) {
            return $next($request);
        }

        throw ValidationException::withMessages([
            'sanction' => self::message($blocker),
        ])->redirectTo(route('seller.dashboard'));
    }

    private static function message(Sanction $sanction): string
    {
        $base = match ($sanction->type) {
            SanctionType::ListingBan => 'Kamu sedang diblokir dari mengelola produk',
            SanctionType::SellingSuspension => 'Penjualanmu sedang disuspen',
            SanctionType::PermanentBan => 'Akunmu diblokir permanen',
            SanctionType::Warning,
            SanctionType::CheckoutBan,
            SanctionType::ReviewBan => '',
        };

        if ($base === '') {
            return 'Akunmu sedang dalam masa sanksi.';
        }

        if ($sanction->ends_at === null) {
            return $base.'. Hubungi admin untuk informasi lebih lanjut.';
        }

        return $base.' sampai '.$sanction->ends_at->translatedFormat('d M Y H:i').'.';
    }
}
