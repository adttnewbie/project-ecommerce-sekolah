<?php

namespace App\Http\Controllers;

use App\Models\SellerApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSellerApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $applications = SellerApplication::query()
            ->with('user:id,name,email')
            ->where('status', SellerApplication::PENDING)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/seller-applications/index', [
            'sellerApplications' => $applications->through(fn (SellerApplication $application) => [
                'id' => $application->id,
                'store_name' => $application->store_name,
                'phone' => $application->phone,
                'product_plan' => $application->product_plan,
                'reason' => $application->reason,
                'user' => [
                    'name' => $application->user->name,
                    'email' => $application->user->email,
                ],
                'created_at' => $application->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
