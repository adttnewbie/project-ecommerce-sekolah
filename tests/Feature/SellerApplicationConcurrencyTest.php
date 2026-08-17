<?php

use App\Enums\UserRole;
use App\Http\Controllers\SellerApplicationController;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Genuine concurrency test for the seller application approve/reject transition.
 *
 * Uses a file-backed SQLite database and pcntl_fork so two independent
 * processes race the same transition. The assertion is the invariant:
 * a rejected application must never leave the user promoted to seller.
 */
test('concurrent approve and reject produce a consistent final state', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dir = sys_get_temp_dir().'/seller_approval_'.uniqid();
    mkdir($dir);
    $dbFile = $dir.'/db.sqlite';
    touch($dbFile);
    $readyApprove = $dir.'/ready_approve';
    $readyReject = $dir.'/ready_reject';
    $goFile = $dir.'/go';

    config(['database.default' => 'concurrency']);
    config(['database.connections.concurrency' => [
        'driver' => 'sqlite',
        'database' => $dbFile,
        'prefix' => '',
        'foreign_key_constraints' => true,
    ]]);
    DB::purge('concurrency');
    Artisan::call('migrate:fresh', ['--database' => 'concurrency']);

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $application = SellerApplication::factory()->create([
        'user_id' => $buyer->id,
        'status' => SellerApplication::PENDING,
    ]);
    $applicationId = $application->id;

    // Drop the parent connection so no PDO resource is shared with forked children.
    DB::purge('concurrency');

    $runTransition = function (string $action, string $readyFile) use ($goFile, $applicationId) {
        try {
            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');
            DB::statement('PRAGMA journal_mode = WAL');

            touch($readyFile);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }

            $admin = User::query()->where('role', UserRole::Admin->value)->firstOrFail();
            auth()->setUser($admin);

            $controller = new SellerApplicationController;
            $request = Request::create('/transition', 'POST');
            $request->setUserResolver(fn () => $admin);

            $application = SellerApplication::findOrFail($applicationId);

            if ($action === 'approve') {
                $controller->approve($request, $application);
            } else {
                $controller->reject($request, $application);
            }
        } catch (Throwable) {
            exit(1);
        }

        exit(0);
    };

    $pidApprove = pcntl_fork();
    if ($pidApprove === -1) {
        $this->fail('Unable to fork approve process.');
    }
    if ($pidApprove === 0) {
        $runTransition('approve', $readyApprove);
    }

    $pidReject = pcntl_fork();
    if ($pidReject === -1) {
        $this->fail('Unable to fork reject process.');
    }
    if ($pidReject === 0) {
        $runTransition('reject', $readyReject);
    }

    $deadline = microtime(true) + 10;
    while ((! file_exists($readyApprove) || ! file_exists($readyReject)) && microtime(true) < $deadline) {
        usleep(1000);
    }
    touch($goFile);

    pcntl_waitpid($pidApprove, $statusApprove);
    pcntl_waitpid($pidReject, $statusReject);

    try {
        $approveSucceeded = pcntl_wifexited($statusApprove) && pcntl_wexitstatus($statusApprove) === 0;
        $rejectSucceeded = pcntl_wifexited($statusReject) && pcntl_wexitstatus($statusReject) === 0;

        expect($approveSucceeded || $rejectSucceeded)
            ->toBeTrue('At least one transition should succeed.');

        DB::purge('concurrency');
        DB::reconnect('concurrency');

        $finalApplication = SellerApplication::findOrFail($applicationId);
        $finalUser = User::findOrFail($buyer->id);

        expect($finalApplication->status)
            ->toBeIn([SellerApplication::APPROVED, SellerApplication::REJECTED]);

        if ($finalApplication->status === SellerApplication::APPROVED) {
            expect($finalUser->role)
                ->toBe(UserRole::Seller);
        } else {
            expect($finalUser->role)
                ->toBe(UserRole::Buyer);
        }
    } finally {
        config(['database.default' => 'sqlite']);
        DB::purge('concurrency');
        @unlink($dbFile);
        @unlink($readyApprove);
        @unlink($readyReject);
        @unlink($goFile);
        @unlink($dbFile.'-wal');
        @unlink($dbFile.'-shm');
        @rmdir($dir);
    }
});
