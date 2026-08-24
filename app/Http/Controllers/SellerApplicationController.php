<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
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
        DB::transaction(function () use ($request, $application) {
            $claimed = SellerApplication::query()
                ->whereKey($application->id)
                ->where('status', SellerApplication::PENDING)
                ->lockForUpdate()
                ->first();

            if ($claimed === null) {
                abort(403);
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
                abort(403);
            }

            $claimed->user()->update([
                'role' => UserRole::Seller,
            ]);
        });

        return to_route('admin.seller-applications.index')
            ->with('success', 'Pengajuan seller disetujui.');
    }

    public function reject(Request $request, SellerApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $application, $validated) {
            $claimed = SellerApplication::query()
                ->whereKey($application->id)
                ->where('status', SellerApplication::PENDING)
                ->lockForUpdate()
                ->first();

            if ($claimed === null) {
                abort(403);
            }

            $updated = SellerApplication::query()
                ->whereKey($claimed->id)
                ->where('status', SellerApplication::PENDING)
                ->update([
                    'status' => SellerApplication::REJECTED,
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => $validated['rejection_reason'] ?? null,
                ]);

            if ($updated !== 1) {
                abort(403);
            }
        });

        return to_route('admin.seller-applications.index')
            ->with('success', 'Pengajuan seller ditolak.');
    }
}
