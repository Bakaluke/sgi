<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\QuoteItemController;

Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('products', ProductController::class);
    Route::apiResource('customers', CustomerController::class);

    Route::apiResource('quotes', QuoteController::class);

    Route::post('quotes/{quote}/items', [QuoteItemController::class, 'store']);
    Route::put('quotes/{quote}/items/{quote_item}', [QuoteItemController::class, 'update']);
    Route::delete('quotes/{quote}/items/{quote_item}', [QuoteItemController::class, 'destroy']);

});