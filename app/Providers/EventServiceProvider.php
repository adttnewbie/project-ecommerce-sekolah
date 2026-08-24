<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\PendingOrderCreated;
use App\Events\ProductPendingModeration;
use App\Events\LowStockDetected;
use App\Events\SellerApplicationPending;
use App\Events\OrderItemStatusChanged;
use App\Events\DailyReportSubmitted;
use App\Events\OrderPaymentApproved;
use App\Events\AdminNotificationTriggered;
use App\Listeners\CreatePendingOrderNotification;
use App\Listeners\AdminOrderNotify;
use App\Listeners\CreateProductModerationNotification;
use App\Listeners\AdminProductModerationNotify;
use App\Listeners\CreateLowStockNotification;
use App\Listeners\AdminSellerApplicationNotify;
use App\Listeners\AdminJurusanConsignmentNotify;
use App\Listeners\AdminJurusanDailyReportNotify;
use App\Listeners\PicketOfficerOrderNotify;
use App\Listeners\PicketOrderPaymentNotify;

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
        
        LowStockDetected::class => [
            CreateLowStockNotification::class,
        ],
        
        SellerApplicationPending::class => [
            AdminSellerApplicationNotify::class,
        ],

        OrderItemStatusChanged::class => [
            AdminJurusanConsignmentNotify::class,
            PicketOfficerOrderNotify::class,
        ],

        DailyReportSubmitted::class => [
            AdminJurusanDailyReportNotify::class,
        ],

        OrderPaymentApproved::class => [
            PicketOrderPaymentNotify::class,
        ],

        AdminNotificationTriggered::class => [
            \App\Listeners\AdminNotificationNotify::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
