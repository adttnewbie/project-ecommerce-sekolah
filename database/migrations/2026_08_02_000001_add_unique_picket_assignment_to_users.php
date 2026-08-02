<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->resolveDuplicateAssignments();

        Schema::table('users', function (Blueprint $table) {
            $table->unique('up_jurusan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['up_jurusan_id']);
        });
    }

    /**
     * A picket officer belongs to at most one UP Jurusan. If historic data
     * already contains duplicates (created by the pre-fix race), keep one
     * picket per UP Jurusan (preferring the picket officer with the lowest id)
     * and detach the rest before the unique index can be created.
     */
    private function resolveDuplicateAssignments(): void
    {
        DB::table('users')
            ->whereNotNull('up_jurusan_id')
            ->orderBy('id')
            ->get(['id', 'role', 'up_jurusan_id'])
            ->groupBy('up_jurusan_id')
            ->filter(fn ($group) => $group->count() > 1)
            ->each(function ($group) {
                $keeper = $group->first(
                    fn (object $user) => $user->role === UserRole::PicketOfficer->value,
                ) ?? $group->first();

                $group
                    ->reject(fn (object $user) => $user->id === $keeper->id)
                    ->each(fn (object $user) => DB::table('users')
                        ->where('id', $user->id)
                        ->update(['up_jurusan_id' => null]));
            });
    }
};
