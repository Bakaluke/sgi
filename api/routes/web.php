<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuoteController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'generatePdf'])
    ->name('quotes.pdf');