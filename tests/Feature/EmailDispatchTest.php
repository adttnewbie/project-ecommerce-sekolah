<?php

use App\Mail\ImportantNotificationMail;
use App\Models\NotificationPreference;
use App\Models\User;
use App\Support\EmailDispatch;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    Mail::fake();
});

test('important email is queued by default', function () {
    $user = User::factory()->create();

    $sent = EmailDispatch::toUser($user->id, 'payment', 'test-key-1', [
        'href' => '/orders/1',
        'title' => 'Pembayaran ORD-1 lunas',
        'description' => 'Telah dikonfirmasi picket.',
    ]);

    expect($sent)->toBeTrue();

    Mail::assertQueued(ImportantNotificationMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email)
            && $mail->notificationTitle === 'Pembayaran ORD-1 lunas';
    });
});

test('email is skipped when the user disabled email for the type', function () {
    $user = User::factory()->create();

    NotificationPreference::create([
        'user_id' => $user->id,
        'type' => 'payment',
        'in_app_enabled' => true,
        'email_enabled' => false,
    ]);

    $sent = EmailDispatch::toUser($user->id, 'payment', 'test-key-2', [
        'href' => '/orders/1',
        'title' => 'Pembayaran ditolak',
        'description' => 'Alasan: tidak valid.',
    ]);

    expect($sent)->toBeFalse();

    Mail::assertNothingQueued();
});

test('email is still sent when only in-app is disabled', function () {
    $user = User::factory()->create();

    NotificationPreference::create([
        'user_id' => $user->id,
        'type' => 'order',
        'in_app_enabled' => false,
        'email_enabled' => true,
    ]);

    $sent = EmailDispatch::toUser($user->id, 'order', 'test-key-3', [
        'href' => '/orders/1',
        'title' => 'Pesanan dibatalkan',
        'description' => 'Dibatalkan oleh penjual.',
    ]);

    expect($sent)->toBeTrue();

    Mail::assertQueued(ImportantNotificationMail::class, 1);
});

test('duplicate email with the same key is sent only once', function () {
    $user = User::factory()->create();

    $attributes = [
        'href' => '/orders/1',
        'title' => 'Sanksi diterbitkan',
        'description' => 'Akunmu mendapat peringatan.',
    ];

    expect(EmailDispatch::toUser($user->id, 'system', 'dup-key', $attributes))->toBeTrue();
    expect(EmailDispatch::toUser($user->id, 'system', 'dup-key', $attributes))->toBeFalse();

    Mail::assertQueued(ImportantNotificationMail::class, 1);
});

test('important email renders the title and recipient name', function () {
    $mail = new ImportantNotificationMail(
        recipientName: 'Budi',
        notificationTitle: 'Pembayaran ORD-1 lunas',
        notificationDescription: 'Telah dikonfirmasi picket.',
        actionUrl: 'http://localhost/orders/1',
    );

    expect($mail->envelope()->subject)->toBe('[EduCart] Pembayaran ORD-1 lunas');

    $html = $mail->render();

    expect($html)
        ->toContain('Halo Budi,')
        ->toContain('Pembayaran ORD-1 lunas')
        ->toContain('http://localhost/orders/1');
});
