<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', Rule::enum(UserRole::class)],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = User::query()->withCount(['products', 'orders']);

        if ($search = $validated['q'] ?? null) {
            $escaped = addcslashes($search, '%_\\');
            $query->where(function ($q) use ($escaped) {
                $q->where('name', 'like', "%{$escaped}%")
                    ->orWhere('email', 'like', "%{$escaped}%");
            });
        }

        if ($role = $validated['role'] ?? null) {
            $query->where('role', $role);
        }

        $users = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => [
                    'code' => $user->role->value,
                    'label' => $user->role->label(),
                ],
                'products_count' => $user->products_count,
                'orders_count' => $user->orders_count,
                'created_at' => $user->created_at?->toIso8601String(),
            ]),
            'roles' => UserRole::options(),
            'filters' => [
                'q' => $validated['q'] ?? '',
                'role' => $validated['role'] ?? '',
            ],
        ]);
    }

    public function createAdminJurusan(): Response
    {
        return Inertia::render('admin/users/create-admin-jurusan');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::enum(UserRole::class), 'in:'.UserRole::AdminJurusan->value],
        ]);

        try {
            // Role is not mass-assignable; set it explicitly after validation.
            $user = new User([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
            ]);
            $user->role = $validated['role'] instanceof UserRole
                ? $validated['role']
                : UserRole::from($validated['role']);
            $user->save();
        } catch (UniqueConstraintViolationException) {
            Validator::make($validated, [
                'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
            ])->validate();
        }

        return to_route('admin.users.create-admin-jurusan')
            ->with('success', 'Akun admin jurusan berhasil dibuat.');
    }
}
