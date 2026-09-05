<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\UserRole;
use App\Models\Position;
use App\Models\User;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $throttleKey = 'register|'.(string) request()->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            throw ValidationException::withMessages([
                'email' => __('Terlalu banyak percobaan pendaftaran. Silakan coba lagi dalam satu menit.'),
            ]);
        }

        // Successful signups keep counting toward the ip limit: the goal is
        // capping account-creation volume per ip, not just failed attempts.
        RateLimiter::hit($throttleKey);
        $validator = Validator::make($input, [
            ...$this->profileRules(),
            // Phone stays nullable on profile updates, but registration requires it.
            'phone' => ['required', 'string', 'max:32', 'regex:/^(\+?62|0)[0-9]{8,14}$/'],
            'position_id' => ['required', 'integer', Rule::exists('positions', 'id')],
            'class_id' => ['nullable', 'integer', Rule::exists('classes', 'id')],
            'password' => $this->passwordRules(),
        ]);

        $validator->after(function ($validator) use ($input) {
            $studentPositionId = Position::query()
                ->where('code', Position::STUDENT)
                ->value('id');

            if ($studentPositionId !== null && (int) ($input['position_id'] ?? 0) === (int) $studentPositionId && blank($input['class_id'] ?? null)) {
                $validator->errors()->add('class_id', __('The class field is required for students.'));
            }
        });

        $validator->validate();

        $positionId = (int) $input['position_id'];
        $isStudent = Position::query()
            ->whereKey($positionId)
            ->where('code', Position::STUDENT)
            ->exists();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'role' => UserRole::Buyer,
            'password' => $input['password'],
            'position_id' => $positionId,
            'class_id' => $isStudent ? (int) $input['class_id'] : null,
        ]);

        return $user;
    }
}
