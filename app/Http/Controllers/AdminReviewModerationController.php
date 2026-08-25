<?php

namespace App\Http\Controllers;

use App\Enums\BuyerViolationType;
use App\Enums\ReviewStatus;
use App\Events\ReviewModerationDecided;
use App\Http\Requests\Admin\RejectReviewRequest;
use App\Models\Review;
use App\Support\BuyerSanctionService;
use App\Support\DomainEventService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewModerationController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $reviews = Review::query()
            ->with(['user:id,name,email', 'product:id,name,slug'])
            ->where('status', ReviewStatus::Pending)
            ->oldest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => $reviews->through(fn (Review $review): array => [
                'id' => $review->id,
                'rating' => (int) $review->rating,
                'comment' => $review->comment,
                'submitted_at' => $review->created_at?->diffForHumans() ?? '-',
                'buyer' => [
                    'id' => $review->user->id,
                    'name' => $review->user->name,
                    'email' => $review->user->email,
                ],
                'product' => [
                    'name' => $review->product->name,
                    'slug' => $review->product->slug,
                ],
            ]),
        ]);
    }

    public function approve(Request $request, Review $review): RedirectResponse
    {
        DB::transaction(function () use ($request, $review) {
            $affected = Review::query()
                ->whereKey($review->id)
                ->where('status', ReviewStatus::Pending)
                ->update(['status' => ReviewStatus::Approved]);

            abort_unless($affected === 1, 404);

            DomainEventService::record(
                DomainEventService::AGGREGATE_PRODUCT,
                $review->product_id,
                'review_approved',
                $request->user(),
                ['review_id' => $review->id],
            );

            ReviewModerationDecided::dispatch(
                reviewId: $review->id,
                buyerId: (int) $review->user_id,
                productName: $review->product->name,
                productSlug: $review->product->slug,
                decision: 'approved',
            );
        });

        return back();
    }

    public function reject(RejectReviewRequest $request, Review $review): RedirectResponse
    {
        $reason = trim($request->string('reason')->toString());

        DB::transaction(function () use ($request, $review, $reason) {
            $affected = Review::query()
                ->whereKey($review->id)
                ->where('status', ReviewStatus::Pending)
                ->update([
                    'status' => ReviewStatus::Rejected,
                    'rejection_reason' => $reason,
                ]);

            abort_unless($affected === 1, 404);

            DomainEventService::record(
                DomainEventService::AGGREGATE_PRODUCT,
                $review->product_id,
                'review_rejected',
                $request->user(),
                [
                    'review_id' => $review->id,
                    'reason' => $reason,
                ],
            );

            BuyerSanctionService::recordViolation(
                (int) $review->user_id,
                BuyerViolationType::ReviewRejected,
                review: $review,
                description: $reason !== '' ? 'Ulasan ditolak moderasi: '.$reason : 'Ulasan ditolak moderasi',
            );

            ReviewModerationDecided::dispatch(
                reviewId: $review->id,
                buyerId: (int) $review->user_id,
                productName: $review->product->name,
                productSlug: $review->product->slug,
                decision: 'rejected',
                reason: $reason,
            );
        });

        return back();
    }
}
