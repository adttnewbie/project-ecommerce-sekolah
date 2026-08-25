<?php

namespace App\Http\Controllers;

use App\Enums\BuyerViolationType;
use App\Enums\SanctionStatus;
use App\Enums\SanctionType;
use App\Enums\UserRole;
use App\Models\BuyerViolation;
use App\Models\Sanction;
use App\Models\User;
use App\Support\BuyerSanctionService;
use App\Support\SanctionSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminSanctionController extends Controller
{
    public function index(): Response
    {
        $sanctions = Sanction::query()
            ->with(['user:id,name,email', 'issuer:id,name'])
            ->latest('starts_at')
            ->paginate(10, ['*'], 'sanctions_page')
            ->withQueryString();

        $violations = BuyerViolation::query()
            ->with(['user:id,name,email', 'order:id,code', 'review:id,product_id'])
            ->latest('occurred_at')
            ->paginate(15, ['*'], 'violations_page')
            ->withQueryString();

        return Inertia::render('admin/sanctions/index', [
            'sanctions' => $sanctions->through(fn (Sanction $sanction): array => [
                'id' => $sanction->id,
                'type' => [
                    'code' => $sanction->type->value,
                    'label' => $sanction->type->label(),
                ],
                'status' => [
                    'code' => $sanction->status->value,
                    'label' => $sanction->status->label(),
                ],
                'reason' => $sanction->reason,
                'issued_by' => $sanction->issued_by === null
                    ? 'Sistem'
                    : ($sanction->issuer->name ?? '-'),
                'starts_at' => $sanction->starts_at->toIso8601String(),
                'ends_at' => $sanction->ends_at?->toIso8601String(),
                'is_expired' => $sanction->ends_at !== null && $sanction->ends_at->isPast(),
                'can_lift' => $sanction->status === SanctionStatus::Active,
                'buyer' => [
                    'id' => $sanction->user->id,
                    'name' => $sanction->user->name,
                    'email' => $sanction->user->email,
                ],
            ]),
            'violations' => $violations->through(fn (BuyerViolation $violation): array => [
                'id' => $violation->id,
                'type' => [
                    'code' => $violation->type->value,
                    'label' => $violation->type->label(),
                ],
                'points' => $violation->points,
                'description' => $violation->description,
                'occurred_at' => $violation->occurred_at->toIso8601String(),
                'order_id' => $violation->order_id,
                'order_code' => $violation->order?->code,
                'buyer' => [
                    'id' => $violation->user->id,
                    'name' => $violation->user->name,
                    'email' => $violation->user->email,
                ],
            ]),
            'buyers' => User::query()
                ->where('role', UserRole::Buyer)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'settings' => SanctionSettings::all(),
            'violation_types' => collect(BuyerViolationType::cases())
                ->map(fn (BuyerViolationType $type): array => [
                    'code' => $type->value,
                    'label' => $type->label(),
                    'points' => $type->defaultPoints(),
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', 'in:'.implode(',', [SanctionType::CheckoutBan->value, SanctionType::ReviewBan->value, SanctionType::PermanentBan->value])],
            'reason' => ['nullable', 'string', 'max:1000'],
            'ends_at' => ['nullable', 'date', 'after:now'],
        ]);

        /** @var User $target */
        $target = User::query()->findOrFail((int) $validated['user_id']);

        /** @var User $actor */
        $actor = $request->user();

        BuyerSanctionService::issueSanction(
            target: $target,
            type: SanctionType::from($validated['type']),
            actor: $actor,
            reason: $validated['reason'] ?? null,
            endsAt: isset($validated['ends_at']) ? Carbon::parse($validated['ends_at']) : null,
        );

        return back()->with('success', 'Sanksi berhasil diberikan.');
    }

    public function lift(Request $request, Sanction $sanction): RedirectResponse
    {
        /** @var User $actor */
        $actor = $request->user();

        BuyerSanctionService::lift($sanction, $actor);

        return back()->with('success', 'Sanksi berhasil dicabut.');
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'window_days' => ['required', 'integer', 'min:1', 'max:365'],
            'warning_points' => ['required', 'integer', 'min:1', 'max:100'],
            'receipt_force_complete_count' => ['required', 'integer', 'min:2', 'max:100'],
        ]);

        SanctionSettings::update($validated);

        return back()->with('success', 'Pengaturan sanksi disimpan.');
    }
}
