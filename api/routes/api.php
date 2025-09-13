<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\QuoteItemController;
use App\Http\Controllers\Api\ProductionOrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\DeliveryMethodController;
use App\Http\Controllers\Api\QuoteStatusController;
use App\Http\Controllers\Api\ProductionStatusController;
use App\Http\Controllers\Api\NegotiationSourceController;
use App\Http\Controllers\Api\AccountReceivableController;
use App\Http\Controllers\Api\AccountPayableController;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user();

        $permissions = $user->roles()->with('permissions')->get()
        ->pluck('permissions')->flatten()->pluck('name')->unique()->values()->all();

        $user->permissions = $permissions;
        $user->role = $user->getRoleNames()->first();
        unset($user->roles);

        return $user;
    });

    Route::apiResource('products', ProductController::class);
    
    Route::apiResource('customers', CustomerController::class);

    Route::apiResource('quotes', QuoteController::class);
    Route::post('quotes/{quote}/items', [QuoteItemController::class, 'store']);
    Route::put('quotes/{quote}/items/{quote_item}', [QuoteItemController::class, 'update']);
    Route::delete('quotes/{quote}/items/{quote_item}', [QuoteItemController::class, 'destroy']);

    Route::delete('quote-items/{quote_item}/file', [QuoteItemController::class, 'destroyFile']);

    Route::apiResource('production-orders', ProductionOrderController::class);

    Route::get('/production-orders/{productionOrder}/delivery-protocol-pdf', [ProductionOrderController::class, 'generateDeliveryProtocolPdf']);

    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    Route::get('/settings', [SettingsController::class, 'show']);    
    Route::post('/settings', [SettingsController::class, 'update']);

    Route::post('/stock-movements', [StockMovementController::class, 'store']);
    Route::get('/products/{product}/stock-movements', [StockMovementController::class, 'history']);

    Route::apiResource('users', UserController::class);
    Route::post('/user/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);

    Route::apiResource('categories', CategoryController::class);

    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'getPermissions']);

    Route::apiResource('payment-methods', PaymentMethodController::class);

    Route::apiResource('delivery-methods', DeliveryMethodController::class);
    
    Route::apiResource('quote-statuses', QuoteStatusController::class);

    Route::apiResource('production-statuses', ProductionStatusController::class);

    Route::apiResource('negotiation-sources', NegotiationSourceController::class);

    Route::apiResource('accounts-receivable', AccountReceivableController::class);
    Route::post('/accounts-receivable/{accountReceivable}/register-payment', [AccountReceivableController::class, 'registerPayment']);

    Route::apiResource('accounts-payable', AccountPayableController::class);
    Route::post('/accounts-payable/{accountPayable}/register-payment', [AccountPayableController::class, 'registerPayment']);
});