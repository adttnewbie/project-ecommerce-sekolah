<?php

namespace App\Http\Controllers;

use App\Models\UpJurusanConsignment;
use App\Models\User;
use App\Support\MoneyCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SellerConsignmentController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $seller */
        $seller = $request->user();

        $consignments = UpJurusanConsignment::query()
            ->with(['product:id,name', 'upJurusan:id,name'])
            ->where('seller_id', $seller->id)
            ->latest()
            ->get();

        $earningsByConsignment = MoneyCalculationService::sellerEarningsMap($consignments->modelKeys());
        $paidByConsignment = MoneyCalculationService::paidPayoutMap($consignments->modelKeys());

        return Inertia::render('seller/consignments/index', [
            'consignments' => $consignments
                ->map(function (UpJurusanConsignment $consignment) use ($earningsByConsignment, $paidByConsignment): array {
                    $sellerEarnings = $earningsByConsignment[$consignment->id] ?? 0;
                    $paidAmount = $paidByConsignment[$consignment->id] ?? 0;

                    return [
                        'id' => $consignment->id,
                        'product_name' => $consignment->product->name,
                        'up_jurusan_name' => $consignment->upJurusan->name,
                        'requested_quantity' => $consignment->requested_quantity,
                        'received_quantity' => $consignment->received_quantity,
                        'sold_quantity' => $consignment->sold_quantity,
                        'commission_rate' => $consignment->commission_rate,
                        'seller_earnings' => $sellerEarnings,
                        'paid_amount' => $paidAmount,
                        'unpaid_amount' => max(0, $sellerEarnings - $paidAmount),
                        'status' => [
                            'code' => $consignment->status->value,
                            'label' => $consignment->status->label(),
                        ],
                    ];
                })
                ->all(),
        ]);
    }
}
