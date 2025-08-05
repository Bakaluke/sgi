<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\ProductionOrderController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'generatePdf'])->name('quotes.pdf');

Route::get('/production-orders/{productionOrder}/work-order', [ProductionOrderController::class, 'generateWorkOrderPdf'])->name('production.work-order.pdf');

Route::get('/production-orders/{productionOrder}/delivery-protocol', [ProductionOrderController::class, 'generateDeliveryProtocolPdf'])->name('production.delivery-protocol.pdf');
