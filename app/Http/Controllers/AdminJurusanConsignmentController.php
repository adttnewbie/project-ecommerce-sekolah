<?php

namespace App\Http\Controllers;

use App\Events\OrderItemStatusChanged;
use App\Models\UpJurusanConsignment;
use App\Models\User;
use App\Support\ConsignmentPayoutService;
use App\Support\ConsignmentTransitionService;
use App\Support\MoneyCalculationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminJurusanConsignmentController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $adminJurusan */
        $adminJurusan = $request->user();
        $validated = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $consignments = UpJurusanConsignment::query()
            ->with(['seller:id,name', 'product:id,name', 'upJurusan:id,name,admin_jurusan_id'])
            ->whereHas('upJurusan', fn ($query) => $query->where('admin_jurusan_id', $adminJurusan->id))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin-jurusan/consignments/index', [
            'consignments' => $consignments->through(fn (UpJurusanConsignment $consignment) => [
                'id' => $consignment->id,
                'seller_name' => $consignment->seller->name,
                'product_name' => $consignment->product->name,
                'up_jurusan_name' => $consignment->upJurusan->name,
                'requested_quantity' => $consignment->requested_quantity,
                'status' => [
                    'code' => $consignment->status->value,
                    'label' => $consignment->status->label(),
                ],
            ]),
        ]);
    }

    public function show(Request $request, UpJurusanConsignment $consignment): Response
    {
        $this->authorizeAdminJurusan($request, $consignment);

        $consignment->load([
            'seller:id,name,email',
            'product:id,name,description,price,stock',
            'upJurusan:id,name,admin_jurusan_id',
        ]);
        $sellerEarnings = MoneyCalculationService::sellerEarningsFromOutMovements($consignment->id);
        $paidAmount = MoneyCalculationService::paidPayoutAmount($consignment->id);

        return Inertia::render('admin-jurusan/consignments/show', [
            'consignment' => [
                'id' => $consignment->id,
                'seller' => [
                    'id' => $consignment->seller->id,
                    'name' => $consignment->seller->name,
                    'email' => $consignment->seller->email,
                ],
                'product' => [
                    'id' => $consignment->product->id,
                    'name' => $consignment->product->name,
                    'description' => $consignment->product->description,
                    'price' => $consignment->product->price,
                    'stock' => $consignment->product->stock,
                ],
                'up_jurusan' => [
                    'id' => $consignment->upJurusan->id,
                    'name' => $consignment->upJurusan->name,
                ],
                'requested_quantity' => $consignment->requested_quantity,
                'received_quantity' => $consignment->received_quantity,
                'sold_quantity' => $consignment->sold_quantity,
                'commission_rate' => $consignment->commission_rate,
                'seller_earnings' => $sellerEarnings,
                'paid_amount' => $paidAmount,
                'unpaid_amount' => MoneyCalculationService::unpaidSellerAmount($consignment->id),
                'status' => [
                    'code' => $consignment->status->value,
                    'label' => $consignment->status->label(),
                ],
                'created_at' => $consignment->created_at?->toIso8601String(),
            ],
        ]);
    }

    public function approve(Request $request, UpJurusanConsignment $consignment): RedirectResponse
    {
        $this->authorizeAdminJurusan($request, $consignment);

        $validated = $request->validate([
            'commission_rate' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        DB::transaction(function () use ($request, $consignment, $validated) {
            ConsignmentTransitionService::approve(
                $consignment,
                (int) $validated['commission_rate'],
                $request->user(),
            );

            OrderItemStatusChanged::dispatch(
                orderItemId: null,
                orderId: null,
                productId: $consignment->product_id,
                consignmentId: $consignment->id,
                productName: $consignment->product->name,
                sellerName: $consignment->seller->name,
                buyerName: 'Admin Jurusan',
                action: 'disetujui dengan komisi ' . $validated['commission_rate'] . '%',
                picketId: null
            );
        });

        return to_route('admin-jurusan.consignments.index')
            ->with('success', 'Request titip barang disetujui.');
    }

    public function reject(Request $request, UpJurusanConsignment $consignment): RedirectResponse
    {
        $this->authorizeAdminJurusan($request, $consignment);

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $consignment, $validated) {
            ConsignmentTransitionService::reject(
                $consignment,
                $validated['rejection_reason'],
                $request->user(),
            );

            OrderItemStatusChanged::dispatch(
                orderItemId: null,
                orderId: null,
                productId: $consignment->product_id,
                consignmentId: $consignment->id,
                productName: $consignment->product->name,
                sellerName: $consignment->seller->name,
                buyerName: 'Admin Jurusan',
                action: 'ditolak: ' . $validated['rejection_reason'],
                picketId: null
            );
        });

        return to_route('admin-jurusan.consignments.index')
            ->with('success', 'Request titip barang ditolak.');
    }

    public function cancel(Request $request, UpJurusanConsignment $consignment): RedirectResponse
    {
        $this->authorizeAdminJurusan($request, $consignment);

        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($request, $consignment, $validated) {
            ConsignmentTransitionService::cancel(
                $consignment,
                $validated['note'] ?? null,
                $request->user(),
            );

            OrderItemStatusChanged::dispatch(
                orderItemId: null,
                orderId: null,
                productId: $consignment->product_id,
                consignmentId: $consignment->id,
                productName: $consignment->product->name,
                sellerName: $consignment->seller->name,
                buyerName: 'Admin Jurusan',
                action: 'dibatalkan' . ($validated['note'] ? ': ' . $validated['note'] : ''),
                picketId: null
            );
        });

        return to_route('admin-jurusan.consignments.index')
            ->with('success', 'Request titip barang dibatalkan.');
    }

    public function payout(Request $request, UpJurusanConsignment $consignment): RedirectResponse
    {
        /** @var User $adminJurusan */
        $adminJurusan = $request->user();
        $this->authorizeAdminJurusan($request, $consignment);
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        ConsignmentPayoutService::execute(
            $consignment,
            $adminJurusan,
            (int) $validated['amount'],
            $validated['note'] ?? null,
        );

        return to_route('admin-jurusan.consignments.show', $consignment)
            ->with('success', 'Pencairan seller berhasil dicatat.');
    }

    private function authorizeAdminJurusan(Request $request, UpJurusanConsignment $consignment): void
    {
        /** @var User $adminJurusan */
        $adminJurusan = $request->user();
        $consignment->load('upJurusan:id,admin_jurusan_id');

        abort_unless($consignment->upJurusan->admin_jurusan_id === $adminJurusan->id, 403);
    }
}
