<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationDismissal;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display paginated notification center page.
     */
    public function index(Request $request): RedirectResponse|Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $page = $request->get('page', 1);
        $filter = $request->get('filter', 'all'); // all, unread, order, stock, product, payment, system, promotion

        $query = Notification::query()
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Apply filters
        match ($filter) {
            'unread' => $query->unread()->active(),
            'read' => $query->read()->active(),
            default => $query->active(),
        };

        // Filter by type if specified
        if (in_array($filter, ['order', 'stock', 'product', 'payment', 'system', 'promotion'])) {
            $query->where('type', $filter);
        }

        $notifications = $query->paginate(20)->withQueryString();

        return inertia('Notifications/index', [
            'notifications' => $this->transformNotifications($notifications->items()),
            'meta' => [
                'current_page' => (int) $notifications->currentPage(),
                'last_page' => (int) $notifications->lastPage(),
                'per_page' => (int) $notifications->perPage(),
                'total' => (int) $notifications->total(),
                'from' => (int) $notifications->firstItem(),
                'to' => (int) $notifications->lastItem(),
            ],
            'filter' => $filter,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $key): RedirectResponse
    {
        $notification = Notification::where('user_id', $request->user()?->id)
            ->where('key', $key)
            ->firstOrFail();

        $notification->markAsRead();

        return back();
    }

    /**
     * Mark all notifications as read for current user.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        Notification::where('user_id', $request->user()?->id)
            ->unread()
            ->active()
            ->update(['read_at' => now()]);

        return back();
    }

    /**
     * Mark selected notifications as read (batch operation).
     */
    public function batchMarkAsRead(Request $request): RedirectResponse
    {
        /** @var list<string> $keys */
        $keys = (array) $request->input('keys', []);

        if ($keys === []) {
            return back();
        }

        Notification::where('user_id', $request->user()?->id)
            ->whereIn('key', $keys)
            ->unread()
            ->active()
            ->update(['read_at' => now()]);

        return back();
    }

    /**
     * Dismiss (archive) a specific notification.
     *
     * Records the dismissal per user so derived action items stay hidden and,
     * when the key matches a persisted notification, marks it dismissed too.
     */
    public function dismiss(Request $request, string $key): RedirectResponse
    {
        $notification = Notification::where('user_id', auth()->id())
            ->where('key', $key)
            ->active()
            ->first();

        if ($notification === null) {
            // Not an owned persisted notification. If the key belongs to any
            // other user's notification we must not leak its existence;
            // otherwise treat it as a derived action-item key.
            $existsForOtherUser = Notification::where('key', $key)
                ->where('user_id', '!=', $request->user()?->id)
                ->exists();

            abort_if($existsForOtherUser, 404);

            NotificationDismissal::firstOrCreate([
                'user_id' => (int) $request->user()?->id,
                'key' => $key,
            ]);

            return back()->with('toast', ['message' => 'Notifikasi dihapus']);
        }

        NotificationDismissal::firstOrCreate([
            'user_id' => (int) $request->user()?->id,
            'key' => $key,
        ]);

        $notification->markAsDismissed();

        return back()->with('toast', ['message' => 'Notifikasi dihapus']);
    }

    /**
     * Restore dismissed notification from archive.
     */
    public function restore(Request $request, string $key): RedirectResponse
    {
        NotificationDismissal::where('user_id', $request->user()?->id)
            ->where('key', $key)
            ->delete();

        Notification::where('user_id', $request->user()?->id)
            ->where('key', $key)
            ->whereNotNull('dismissed_at')
            ->get()
            ->each(fn (Notification $notification) => $notification->update([
                'dismissed_at' => null,
            ]));

        return back()->with('toast', ['message' => 'Notifikasi dipulihkan']);
    }

    /**
     * Get recent notifications for dropdown (max 10).
     */
    public function getRecent(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()?->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $this->transformNotificationsCollection($notifications),
        ]);
    }

    /**
     * Get unread count for header badge.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        return response()->json([
            'data' => Notification::countUnreadForUser($user->id),
        ]);
    }

    /**
     * Transform paginated collection for frontend.
     *
     * @param  array<int, Notification>  $notifications
     * @return array<int, array<string, mixed>>
     */
    private function transformNotifications(array $notifications): array
    {
        return collect($notifications)->map(function (Notification $notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'description' => $notification->description,
                'href' => $notification->href,
                'is_read' => $notification->read_at !== null,
                'is_dismissed' => $notification->dismissed_at !== null,
                'created_at' => $notification->created_at->toISOString(),
                'data' => $notification->data,
            ];
        })->toArray();
    }

    /**
     * Transform collection for dropdown (no pagination).
     *
     * @param  Collection<int, Notification>  $collection
     * @return array<int, array<string, mixed>>
     */
    private function transformNotificationsCollection(Collection $collection): array
    {
        return $collection->map(function (Notification $notification) {
            return [
                'key' => $notification->key,
                'type' => $notification->type,
                'title' => $notification->title,
                'description' => $notification->description,
                'href' => $notification->href,
                'is_read' => $notification->read_at !== null,
                'created_at' => $notification->created_at->toISOString(),
            ];
        })->toArray();
    }
}
