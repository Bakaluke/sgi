<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\ProductionOrderController;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/instalar-sgi-forca-bruta', function () {
    try {
        Artisan::call('optimize:clear');
        Artisan::call('migrate:fresh --seed --force');        
        return "<h1>SUCESSO!</h1><p>Banco de dados recriado e populado.</p><pre>" . Artisan::output() . "</pre>";
    } catch (\Exception $e) {
        return "<h1>ERRO!</h1><p>" . $e->getMessage() . "</p>";
    }
});