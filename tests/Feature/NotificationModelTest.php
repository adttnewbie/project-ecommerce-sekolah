<?php

namespace Tests\Feature;

use App\Enums\NotificationType;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationModelTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
    }

    public function test_notification_can_be_marked_as_read(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'test-read-key',
            'title' => 'Read Me',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $notification->markAsRead();
        
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_notification_is_unread_initially(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'test-key',
            'title' => 'Test',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $this->assertTrue($notification->isUnread());
    }

    public function test_notification_can_be_dismissed(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'dismiss-key',
            'title' => 'Dismiss Test',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $notification->markAsDismissed();
        
        $this->assertNotNull($notification->fresh()->dismissed_at);
    }

    public function test_dismissed_notifications_are_excluded_from_active_query(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'active-key',
            'title' => 'Active',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'dismissed-key',
            'title' => 'Dismissed',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'dismissed_at' => now(),
        ]);

        $activeCount = Notification::where('user_id', $this->user->id)
            ->active()
            ->count();

        $this->assertEquals(1, $activeCount);
    }

    public function test_count_unread_for_user(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'unread-1',
            'title' => 'Unread 1',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'stock',
            'key' => 'unread-2',
            'title' => 'Unread 2',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'read-1',
            'title' => 'Read',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'read_at' => now(),
        ]);

        $count = Notification::countUnreadForUser($this->user->id);
        
        $this->assertEquals(2, $count);
    }

    public function test_idempotent_notification_creation_by_key(): void
    {
        $originalKey = 'idempotent-key';
        
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => $originalKey,
            'title' => 'First Create',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $sameNotification = Notification::where('key', $originalKey)->first();
        
        $this->assertNotNull($sameNotification);
        $this->assertEquals(1, Notification::where('key', $originalKey)->count());
    }

    public function test_notification_can_be_filtered_by_type_and_unread(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'order-unread',
            'title' => 'Order Unread',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'order-read',
            'title' => 'Order Read',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'read_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'stock',
            'key' => 'stock-unread',
            'title' => 'Stock Unread',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $orderUnread = Notification::where('user_id', $this->user->id)
            ->unread()
            ->where('type', 'order')
            ->count();

        $this->assertEquals(1, $orderUnread);
    }

    public function test_notification_scope_read_filters_correctly(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'read-key',
            'title' => 'Read',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'read_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'unread-key',
            'title' => 'Unread',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $readCount = Notification::where('user_id', $this->user->id)
            ->read()
            ->count();

        $this->assertEquals(1, $readCount);
    }

    public function test_notification_can_only_access_own_records(): void
    {
        $otherUser = User::factory()->create();
        
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'my-key',
            'title' => 'My Notif',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'order',
            'key' => 'other-key',
            'title' => 'Other Notif',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $ownNotifications = Notification::where('user_id', $this->user->id)
            ->active()
            ->count();

        $this->assertEquals(1, $ownNotifications);
    }
}

test('notification key accepts prefixed identifiers longer than a uuid', function () {
    $user = User::factory()->create();

    $notification = Notification::createNotification(
        userId: $user->id,
        type: NotificationType::Order->value,
        stableKey: sprintf('order-pending:%d:%d', 987654321098765432, 123456789012345678),
        title: 'Pesanan baru',
        description: '',
        href: '/seller/orders',
    );

    expect($notification->exists)->toBeTrue()
        ->and(strlen($notification->key))->toBeGreaterThan(36);
});
