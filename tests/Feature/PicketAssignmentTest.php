<?php

use App\Enums\UserRole;
use App\Models\UpJurusan;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * @return array{0: User, 1: UpJurusan}
 */
function picketUpJurusanFixture(): array
{
    $admin = User::factory()->create(['role' => UserRole::AdminJurusan]);

    return [$admin, UpJurusan::factory()->create(['admin_jurusan_id' => $admin->id])];
}

test('admin jurusan can assign an unassigned picket officer to own up jurusan', function () {
    [$admin, $upJurusan] = picketUpJurusanFixture();
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);

    $this->actingAs($admin)
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $picket->id,
        ])
        ->assertRedirect(route('admin-jurusan.up-jurusan.index'))
        ->assertSessionHas('success');

    expect($picket->fresh()->up_jurusan_id)->toBe($upJurusan->id);
});

test('assigning the same picket to the same up jurusan is idempotent', function () {
    [$admin, $upJurusan] = picketUpJurusanFixture();
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);

    $this->actingAs($admin)
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $picket->id,
        ])
        ->assertRedirect(route('admin-jurusan.up-jurusan.index'))
        ->assertSessionHas('success');

    expect($picket->fresh()->up_jurusan_id)->toBe($upJurusan->id);
});

test('assigning a picket that belongs to another up jurusan is rejected', function () {
    [$admin, $upJurusan] = picketUpJurusanFixture();
    [$otherAdmin, $otherUpJurusan] = picketUpJurusanFixture();
    $picket = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $otherUpJurusan->id,
    ]);

    $this->actingAs($admin)
        ->from(route('admin-jurusan.up-jurusan.index'))
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $picket->id,
        ])
        ->assertSessionHasErrors(['picket_id' => 'Picket officer sudah ditugaskan ke UP Jurusan lain.']);

    expect($picket->fresh()->up_jurusan_id)->toBe($otherUpJurusan->id);
});

test('assigning a new picket replaces the current picket of the up jurusan', function () {
    [$admin, $upJurusan] = picketUpJurusanFixture();
    $current = User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);
    $replacement = User::factory()->create(['role' => UserRole::PicketOfficer]);

    $this->actingAs($admin)
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $replacement->id,
        ])
        ->assertRedirect(route('admin-jurusan.up-jurusan.index'))
        ->assertSessionHas('success');

    expect($current->fresh()->up_jurusan_id)->toBeNull()
        ->and($replacement->fresh()->up_jurusan_id)->toBe($upJurusan->id);
});

test('concurrent assignment of the same picket to two up jurusans cannot succeed twice', function () {
    [$adminOne, $upOne] = picketUpJurusanFixture();
    [$adminTwo, $upTwo] = picketUpJurusanFixture();
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);

    $this->actingAs($adminOne)
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upOne), [
            'picket_id' => $picket->id,
        ])
        ->assertRedirect(route('admin-jurusan.up-jurusan.index'));

    $this->actingAs($adminTwo)
        ->from(route('admin-jurusan.up-jurusan.index'))
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upTwo), [
            'picket_id' => $picket->id,
        ])
        ->assertSessionHasErrors(['picket_id' => 'Picket officer sudah ditugaskan ke UP Jurusan lain.']);

    expect($picket->fresh()->up_jurusan_id)->toBe($upOne->id);
});

test('unique index prevents two pickets from being assigned to the same up jurusan', function () {
    [$admin, $upJurusan] = picketUpJurusanFixture();

    User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]);

    expect(fn () => User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusan->id,
    ]))->toThrow(UniqueConstraintViolationException::class);
});

test('users table has a unique index on up_jurusan_id', function () {
    expect(Schema::hasIndex('users', ['up_jurusan_id']))->toBeTrue();
});

test('picket assignment locks the picket row inside a transaction', function () {
    if (DB::getDriverName() !== 'mysql') {
        $this->markTestSkipped('Row-level locks are only enforced on MySQL/PostgreSQL.');
    }

    [$admin, $upJurusan] = picketUpJurusanFixture();
    $picket = User::factory()->create(['role' => UserRole::PicketOfficer]);

    $executed = [];
    DB::listen(function ($query) use (&$executed) {
        $executed[] = $query->sql;
    });

    $this->actingAs($admin)
        ->post(route('admin-jurusan.up-jurusan.assign-picket', $upJurusan), [
            'picket_id' => $picket->id,
        ])
        ->assertRedirect();

    $hasLockingRead = collect($executed)
        ->contains(fn (string $sql) => str_contains(strtolower($sql), 'for update'));

    expect($hasLockingRead)->toBeTrue();
});
