<?php

namespace App\Providers;

use App\Events\AdminNotificationTriggered;
use App\Events\BuyerOrderStateChanged;
use App\Events\DailyReportSubmitted;
use App\Events\LowStockDetected;
use App\Events\OrderItemCancelled;
use App\Events\OrderItemStatusChanged;
use App\Events\OrderPaymentApproved;
use App\Events\PendingOrderCreated;
use App\Events\ProductModerationDecided;
use App\Events\ProductPendingModeration;
use App\Events\SellerApplicationPending;
use App\Listeners\AdminJurusanConsignmentNotify;
use App\Listeners\AdminJurusanDailyReportNotify;
use App\Listeners\AdminNotificationNotify;
use App\Listeners\AdminOrderNotify;
use App\Listeners\AdminProductModerationNotify;
use App\Listeners\AdminSellerApplicationNotify;
use App\Listeners\BuyerItemCancelledNotify;
use App\Listeners\BuyerOrderStatusNotify;
use App\Listeners\BuyerPaymentDecidedNotify;
use App\Listeners\CreateLowStockNotification;
use App\Listeners\CreateModerationResultNotification;
use App\Listeners\CreatePendingOrderNotification;
use App\Listeners\CreateProductModerationNotification;
use App\Listeners\PersistBuyerOrderNotice;
use App\Listeners\PicketOfficerOrderNotify;
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

        BuyerOrderStateChanged::class => [
            PersistBuyerOrderNotice::class,
        ],

        AdminNotificationTriggered::class => [
            AdminNotificationNotify::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
