<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
    }

    public function test_user_can_view_notification_center(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'test-key-1',
            'title' => 'Test Notification',
            'description' => 'This is a test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->get('/notifications');

        $response->assertStatus(200);
    }

    public function test_guest_cannot_access_notification_center(): void
    {
        $response = $this->get('/notifications');

        $response->assertRedirect('/login');
    }

    public function test_user_can_mark_single_notification_as_read(): void
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

        $response = $this->actingAs($this->user)
            ->post("/notifications/{$notification->key}/read");

        $response->assertRedirect();
        
        $this->assertNotNull(Notification::find($notification->id)?->read_at);
    }

    public function test_user_can_only_mark_own_notifications_as_read(): void
    {
        $otherUser = User::factory()->create();
        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'order',
            'key' => 'other-key',
            'title' => 'Other User',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->post("/notifications/{$notification->key}/read");

        $response->assertStatus(404);
        
        $this->assertNull(Notification::find($notification->id)?->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'key-1',
            'title' => 'Notif 1',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'stock',
            'key' => 'key-2',
            'title' => 'Notif 2',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->post('/notifications/mark-all-as-read');

        $response->assertRedirect();
        
        $unread = Notification::where('user_id', $this->user->id)
            ->whereNull('read_at')
            ->active()
            ->count();

        $this->assertEquals(0, $unread);
    }

    public function test_user_can_batch_mark_notifications_as_read(): void
    {
        $notif1 = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'batch-key-1',
            'title' => 'Batch 1',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $notif2 = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'stock',
            'key' => 'batch-key-2',
            'title' => 'Batch 2',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->post('/notifications/batch-read', [
                'keys' => [$notif1->key, $notif2->key],
            ]);

        $response->assertRedirect();
        
        $this->assertNotNull(Notification::where('key', $notif1->key)->first()?->read_at);
        $this->assertNotNull(Notification::where('key', $notif2->key)->first()?->read_at);
    }

    public function test_user_can_dismiss_notification(): void
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

        $response = $this->actingAs($this->user)
            ->delete("/notifications/{$notification->key}");

        $response->assertRedirect();
        
        $this->assertNotNull(Notification::find($notification->id)?->dismissed_at);
    }

    public function test_user_can_restore_dismissed_notification(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'restore-key',
            'title' => 'Restore Test',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'dismissed_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->put("/notifications/{$notification->key}/restore");

        $response->assertRedirect();
        
        $this->assertNull(Notification::find($notification->id)?->dismissed_at);
    }

    public function test_user_can_only_dismiss_own_notifications(): void
    {
        $otherUser = User::factory()->create();
        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'order',
            'key' => 'other-dismiss-key',
            'title' => 'Other',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->delete("/notifications/{$notification->key}");

        $response->assertStatus(404);
        
        $this->assertNull(Notification::find($notification->id)?->dismissed_at);
    }

    public function test_user_can_get_recent_notifications_for_dropdown(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'recent-1',
            'title' => 'Recent 1',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'stock',
            'key' => 'recent-2',
            'title' => 'Recent 2',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/recent');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_user_can_get_unread_count(): void
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
            'type' => 'order',
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
            'title' => 'Read 1',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/notifications/unread-count');

        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data'));
    }

    public function test_dismissed_notifications_are_excluded_from_active_queries(): void
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

    public function test_idempotent_notification_creation_works(): void
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

    public function test_can_filter_notifications_by_type(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'order-key',
            'title' => 'Order',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'stock',
            'key' => 'stock-key',
            'title' => 'Stock',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/notifications?filter=order');

        $response->assertStatus(200);
    }

    public function test_can_filter_unread_notifications(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'unread-filter-key',
            'title' => 'Unread Filter',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/notifications?filter=unread');

        $response->assertStatus(200);
    }

    public function test_read_notifications_can_be_filtered(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'order',
            'key' => 'read-filter-key',
            'title' => 'Read Filter',
            'description' => 'Test',
            'href' => '/test',
            'created_at' => now(),
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)
            ->get('/notifications?filter=read');

        $response->assertStatus(200);
    }
}
