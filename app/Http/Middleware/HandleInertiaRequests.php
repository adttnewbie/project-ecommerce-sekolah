<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Notification;
use App\Models\NotificationDismissal;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    private const HEADER_NOTIFICATION_LIMIT = 10; // Reduced from 50 to match dropdown limit requirement

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/server-side-setup#asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $this->authenticatedUserPayload($request),
            ],
            'notificationBadge' => fn () => $this->notificationBadge($request),
            'adminHeader' => fn () => $this->adminHeader($request),
            'sellerHeader' => fn () => $this->sellerHeader($request),
            'adminJurusanHeader' => fn () => $this->adminJurusanHeader($request),
            'picketOfficerHeader' => fn () => $this->picketOfficerHeader($request),
            'buyerHeader' => fn () => $this->buyerHeader($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'receipt_url' => $request->session()->get('receipt_url'),
            ],
        ];
    }

    /**
     * Build the authenticated user payload shared with the client.
     *
     * Only a fixed allow-list of fields is shared instead of the whole model,
     * so attributes that are not explicitly requested never reach the client
     * (defense in depth on top of the model's hidden attributes).
     *
     * @return array{id: int, name: string, email: string, role: string, avatar: null}|null
     */
    private function authenticatedUserPayload(Request $request): ?array
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'avatar' => null,
        ];
    }

    /**
     * Get unread notification count for header badge.
     *
     * @return array{count: int}
     */
    private function notificationBadge(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return ['count' => 0];
        }

        $count = Notification::where('user_id', $user->id)
            ->unread()
            ->active()
            ->count();

        return ['count' => (int) $count];
    }

    /**
     * @return array{notifications: array<int, array{key: string, type: string, title: string, description: string, href: string, is_read: bool, created_at: string}>, supportEmail: string|null}|null
     */
    private function adminHeader(Request $request): ?array
    {
        /** @var User|null $admin */
        $admin = $request->user();

        if ($admin?->role !== UserRole::Admin) {
            return null;
        }

        return [
            'notifications' => $this->persistedNotificationsFor($admin),
            'supportEmail' => config('mail.from.address'),
        ];
    }

    /**
     * @return array{notifications: array<int, array{key: string, type: string, title: string, description: string, href: string, is_read: bool, created_at: string}>, supportEmail: string|null}|null
     */
    private function sellerHeader(Request $request): ?array
    {
        /** @var User|null $seller */
        $seller = $request->user();

        if ($seller?->role !== UserRole::Seller) {
            return null;
        }

        return [
            'notifications' => $this->persistedNotificationsFor($seller),
            'supportEmail' => config('mail.from.address'),
        ];
    }

    /**
     * Latest persisted notifications addressed to the user, honouring their
     * dismissals - the single source of truth shared with /notifications.
     *
     * @return array<int, array{key: string, type: string, title: string, description: string|null, href: string, is_read: bool, created_at: string}>
     */
    private function persistedNotificationsFor(User $user): array
    {
        $dismissedKeys = $this->dismissedNotificationKeys($user);

        return Notification::query()
            ->where('user_id', $user->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit(self::HEADER_NOTIFICATION_LIMIT)
            ->get([
                'key',
                'type',
                'title',
                'description',
                'href',
                'read_at',
                'created_at',
            ])
            ->map(fn (Notification $notification) => [
                'key' => $notification->key,
                'type' => $notification->type,
                'title' => $notification->title,
                'description' => $notification->description,
                'href' => $notification->href,
                'is_read' => $notification->read_at !== null,
                'created_at' => $notification->created_at->toISOString(),
            ])
            ->reject(fn (array $notification) => in_array($notification['key'], $dismissedKeys, true))
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    private function dismissedNotificationKeys(User $user): array
    {
        return NotificationDismissal::query()
            ->where('user_id', $user->id)
            ->pluck('key')
            ->all();
    }

    /**
     * @return array{notifications: array<int, array{key: string, type: string, title: string, description: string, href: string, is_read: bool, created_at: string}>, supportEmail: string|null}|null
     */
    private function adminJurusanHeader(Request $request): ?array
    {
        /** @var User|null $adminJurusan */
        $adminJurusan = $request->user();

        if ($adminJurusan?->role !== UserRole::AdminJurusan) {
            return null;
        }

        $notifications = Notification::query()
            ->where('user_id', $adminJurusan->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit(self::HEADER_NOTIFICATION_LIMIT)
            ->get([
                'key',
                'type',
                'title',
                'description',
                'href',
                'read_at',
                'created_at',
            ]);

        $supportEmail = config('mail.from.address');

        return [
            'notifications' => $notifications->map(function ($notification) {
                return [
                    'key' => $notification->key,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'description' => $notification->description,
                    'href' => $notification->href,
                    'is_read' => $notification->read_at !== null,
                    'created_at' => $notification->created_at->toISOString(),
                ];
            })->values()->all(),
            'supportEmail' => $supportEmail,
        ];
    }

    /**
     * @return array{notifications: array<int, array{key: string, type: string, title: string, description: string, href: string, is_read: bool, created_at: string}>, supportEmail: string|null}|null
     */
    private function picketOfficerHeader(Request $request): ?array
    {
        /** @var User|null $picket */
        $picket = $request->user();

        if ($picket?->role !== UserRole::PicketOfficer) {
            return null;
        }

        $notifications = Notification::query()
            ->where('user_id', $picket->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit(self::HEADER_NOTIFICATION_LIMIT)
            ->get([
                'key',
                'type',
                'title',
                'description',
                'href',
                'read_at',
                'created_at',
            ]);

        $supportEmail = config('mail.from.address');

        return [
            'notifications' => $notifications->map(function ($notification) {
                return [
                    'key' => $notification->key,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'description' => $notification->description,
                    'href' => $notification->href,
                    'is_read' => $notification->read_at !== null,
                    'created_at' => $notification->created_at->toISOString(),
                ];
            })->values()->all(),
            'supportEmail' => $supportEmail,
        ];
    }

    /**
     * @return array{id: int, cartItemsCount: int}|null
     */
    private function buyerHeader(Request $request): ?array
    {
        /** @var User|null $buyer */
        $buyer = $request->user();

        if ($buyer?->role !== UserRole::Buyer) {
            return null;
        }

        $dismissedKeys = $this->dismissedNotificationKeys($buyer);

        // Persisted notifications addressed to this buyer (order progress,
        // payment decisions, cancellations), newest first.
        $notifications = Notification::query()
            ->where('user_id', $buyer->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->limit(self::HEADER_NOTIFICATION_LIMIT)
            ->get([
                'key',
                'type',
                'title',
                'description',
                'href',
                'read_at',
                'created_at',
            ])
            ->map(fn (Notification $notification) => [
                'key' => $notification->key,
                'type' => $notification->type,
                'title' => $notification->title,
                'description' => $notification->description,
                'href' => $notification->href,
                'is_read' => $notification->read_at !== null,
                'created_at' => $notification->created_at->toISOString(),
            ])
            ->reject(fn (array $notification) => in_array($notification['key'], $dismissedKeys, true))
            ->values()
            ->all();

        return [
            'id' => $buyer->id,
            'cartItemsCount' => (int) CartItem::query()
                ->where('user_id', $buyer->id)
                ->count(),
            'notifications' => $notifications,
        ];
    }
}
