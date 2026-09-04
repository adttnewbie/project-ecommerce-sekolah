<?php

use App\Http\Controllers\WaWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/wa/webhook', [WaWebhookController::class, 'handle'])->name('api.wa.webhook');
