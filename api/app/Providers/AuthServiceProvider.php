<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Policies\ProductPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\QuotePolicy;
use App\Policies\QuoteItemPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Customer::class => CustomerPolicy::class,
        Quote::class => QuotePolicy::class,
        QuoteItem::class => QuoteItemPolicy::class,
    ];

    public function boot(): void
    {
        
    }
}