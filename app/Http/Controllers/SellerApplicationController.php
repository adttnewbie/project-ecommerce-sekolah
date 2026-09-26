<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Events\SellerApplicationDecided;
use App\Events\SellerApplicationPending;
use App\Models\SellerApplication;
use App\Models\User;
use App\Support\ActorLifecycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SellerApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== UserRole::Buyer) {
            abort(403);
        }

        $application = SellerApplication::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        return Inertia::render('seller-application/index', [
            'application' => $application ? [
                'id' => $application->id,
                'store_name' => $application->store_name,
                'phone' => $application->phone,
                'product_plan' => $application->product_plan,
                'reason' => $application->reason,
                'status' => $application->status,
                'rejection_reason' => $application->rejection_reason,
                'created_at' => $application->created_at?->toIso8601String(),
                'reviewed_at' => $application->reviewed_at?->toIso8601String(),
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->role !== UserRole::Buyer) {
            abort(403);
        }

        $hasPendingApplication = SellerApplication::query()
            ->where('user_id', $user->id)
            ->where('status', SellerApplication::PENDING)
            ->exists();

        if ($hasPendingApplication) {
            throw ValidationException::withMessages([
                'store_name' => 'Pengajuan seller kamu masih menunggu review admin.',
            ]);
        }

        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'product_plan' => ['required', 'string', 'max:1000'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        SellerApplication::query()->create([
            ...$validated,
            'user_id' => $user->id,
            'status' => SellerApplication::PENDING,
        ]);

        $application = SellerApplication::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        SellerApplicationPending::dispatch(
            applicationId: $application->id,
            applicantName: $user->name,
            storeName: $validated['store_name']
        );

        return to_route('seller-application.index')
            ->with('success', 'Pengajuan seller berhasil dikirim.');
    }

    public function approve(Request $request, SellerApplication $application): RedirectResponse
    {
        $decided = null;

        DB::transaction(function () use ($request, $application, &$decided) {
            $claimed = SellerApplication::query()
                ->whereKey($application->id)
                ->where('status', SellerApplication::PENDING)
                ->lockForUpdate()
                ->first();

            if ($claimed === null) {
                throw ValidationException::withMessages([
                    'application' => 'Pengajuan ini sudah diputuskan atau tidak lagi menunggu review.',
                ]);
            }

            /** @var User $applicant */
            $applicant = $claimed->user;
            ActorLifecycle::assertCanPromoteToSeller($applicant);
            $this->authorize('promoteToSeller', $applicant);

            $updated = SellerApplication::query()
                ->whereKey($claimed->id)
                ->where('status', SellerApplication::PENDING)
                ->update([
                    'status' => SellerApplication::APPROVED,
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => null,
                ]);

            if ($updated !== 1) {
                throw ValidationException::withMessages([
                    'application' => 'Pengajuan ini sudah diputuskan atau tidak lagi menunggu review.',
                ]);
            }

            $claimed->user()->update([
                'role' => UserRole::Seller,
            ]);

            $decided = [
                'applicationId' => $claimed->id,
                'userId' => $claimed->user_id,
                'storeName' => $claimed->store_name,
            ];
        });

        if ($decided !== null) {
            SellerApplicationDecided::dispatch(
                applicationId: $decided['applicationId'],
                userId: $decided['userId'],
                decision: 'approved',
                storeName: $decided['storeName'],
            );
        }

        return to_route('admin.seller-applications.index')
            ->with('success', 'Pengajuan seller disetujui.');
    }

    public function reject(Request $request, SellerApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => [
                'required',
                'string',
                'max:1000',
                static function (string $attribute, mixed $value, callable $fail): void {
                    if (trim((string) $value) === '') {
                        $fail('Alasan penolakan wajib diisi.');
                    }
                },
            ],
        ]);

        $rejectionReason = trim($validated['rejection_reason']);

        $decided = null;

        DB::transaction(function () use ($request, $application, $rejectionReason, &$decided) {
            $claimed = SellerApplication::query()
                ->whereKey($application->id)
                ->where('status', SellerApplication::PENDING)
                ->lockForUpdate()
                ->first();

            if ($claimed === null) {
                throw ValidationException::withMessages([
                    'application' => 'Pengajuan ini sudah diputuskan atau tidak lagi menunggu review.',
                ]);
            }

            $updated = SellerApplication::query()
                ->whereKey($claimed->id)
                ->where('status', SellerApplication::PENDING)
                ->update([
                    'status' => SellerApplication::REJECTED,
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => $rejectionReason,
                ]);

            if ($updated !== 1) {
                throw ValidationException::withMessages([
                    'application' => 'Pengajuan ini sudah diputuskan atau tidak lagi menunggu review.',
                ]);
            }

            $decided = [
                'applicationId' => $claimed->id,
                'userId' => $claimed->user_id,
                'storeName' => $claimed->store_name,
                'rejectionReason' => $rejectionReason,
            ];
        });

        if ($decided !== null) {
            SellerApplicationDecided::dispatch(
                applicationId: $decided['applicationId'],
                userId: $decided['userId'],
                decision: 'rejected',
                storeName: $decided['storeName'],
                rejectionReason: $decided['rejectionReason'],
            );
        }

        return to_route('admin.seller-applications.index')
            ->with('success', 'Pengajuan seller ditolak.');
    }
}
