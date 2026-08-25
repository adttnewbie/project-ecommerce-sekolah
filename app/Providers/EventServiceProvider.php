<?php

namespace App\Providers;

use App\Events\AdminNotificationTriggered;
use App\Events\BuyerOrderStateChanged;
use App\Events\DailyReportSubmitted;
use App\Events\LowStockDetected;
use App\Events\OrderItemCancelled;
use App\Events\OrderItemsAwaitingVerification;
use App\Events\OrderItemStatusChanged;
use App\Events\OrderPaymentApproved;
use App\Events\PendingOrderCreated;
use App\Events\ProductModerationDecided;
use App\Events\ProductPendingModeration;
use App\Events\ReviewModerationDecided;
use App\Events\ReviewPendingModeration;
use App\Events\SanctionIssued;
use App\Events\SanctionLifted;
use App\Events\SellerApplicationPending;
use App\Listeners\AdminJurusanConsignmentNotify;
use App\Listeners\AdminJurusanDailyReportNotify;
use App\Listeners\AdminNotificationNotify;
use App\Listeners\AdminOrderNotify;
use App\Listeners\AdminProductModerationNotify;
use App\Listeners\AdminReviewModerationNotify;
use App\Listeners\AdminSellerApplicationNotify;
use App\Listeners\BuyerItemCancelledNotify;
use App\Listeners\BuyerOrderStatusNotify;
use App\Listeners\BuyerPaymentDecidedNotify;
use App\Listeners\CreateLowStockNotification;
use App\Listeners\CreateModerationResultNotification;
use App\Listeners\CreatePendingOrderNotification;
use App\Listeners\CreateProductModerationNotification;
use App\Listeners\CreateReviewModerationResultNotification;
use App\Listeners\PersistBuyerOrderNotice;
use App\Listeners\PicketOfficerOrderNotify;
use App\Listeners\PicketVerificationNotify;
use App\Listeners\SanctionIssuedNotify;
use App\Listeners\SanctionLiftedNotify;
use App\Listeners\SellerCancelledOrderNotify;
use App\Listeners\SellerPaymentPaidNotify;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        PendingOrderCreated::class => [
            CreatePendingOrderNotification::class,
            AdminOrderNotify::class,
        ],

        ProductPendingModeration::class => [
            CreateProductModerationNotification::class,
            AdminProductModerationNotify::class,
        ],

        ProductModerationDecided::class => [
            CreateModerationResultNotification::class,
        ],

        ReviewPendingModeration::class => [
            AdminReviewModerationNotify::class,
        ],

        ReviewModerationDecided::class => [
            CreateReviewModerationResultNotification::class,
        ],

        LowStockDetected::class => [
            CreateLowStockNotification::class,
        ],

        SellerApplicationPending::class => [
            AdminSellerApplicationNotify::class,
        ],

        OrderItemStatusChanged::class => [
            AdminJurusanConsignmentNotify::class,
            PicketOfficerOrderNotify::class,
            BuyerOrderStatusNotify::class,
        ],

        DailyReportSubmitted::class => [
            AdminJurusanDailyReportNotify::class,
        ],

        OrderPaymentApproved::class => [
            SellerPaymentPaidNotify::class,
            BuyerPaymentDecidedNotify::class,
        ],

        OrderItemCancelled::class => [
            SellerCancelledOrderNotify::class,
            BuyerItemCancelledNotify::class,
        ],

        OrderItemsAwaitingVerification::class => [
            PicketVerificationNotify::class,
        ],

        BuyerOrderStateChanged::class => [
            PersistBuyerOrderNotice::class,
        ],

        AdminNotificationTriggered::class => [
            AdminNotificationNotify::class,
        ],

        SanctionIssued::class => [
            SanctionIssuedNotify::class,
        ],

        SanctionLifted::class => [
            SanctionLiftedNotify::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
