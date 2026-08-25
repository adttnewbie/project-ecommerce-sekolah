<?php

namespace App\Http\Middleware;

use App\Enums\SanctionType;
use App\Enums\UserRole;
use App\Models\Sanction;
use App\Models\User;
use App\Support\BuyerSanctionService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class EnsureBuyerNotBanned
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $scope = 'checkout'): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user === null || $user->role !== UserRole::Buyer) {
            return $next($request);
        }

        $blocker = $scope === 'review'
            ? BuyerSanctionService::activeReviewBlocker($user)
            : BuyerSanctionService::activeCheckoutBlocker($user);

        if ($blocker === null) {
            return $next($request);
        }

        throw ValidationException::withMessages([
            'sanction' => self::message($blocker),
        ])->redirectTo(route('orders.index'));
    }

    private static function message(Sanction $sanction): string
    {
        $base = match ($sanction->type) {
            SanctionType::CheckoutBan => 'Kamu sedang diblokir dari checkout',
            SanctionType::ReviewBan => 'Kamu sedang diblokir dari memberi ulasan',
            SanctionType::PermanentBan => 'Akunmu diblokir permanen',
            SanctionType::Warning => '',
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
