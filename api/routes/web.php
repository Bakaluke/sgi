<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\ProductionOrderController;

Route::get('/', function () {
    return view('welcome');
});
