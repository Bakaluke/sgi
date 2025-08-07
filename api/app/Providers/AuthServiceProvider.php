<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\ProductionOrder;
use App\Models\Setting;
use App\Policies\ProductPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\QuotePolicy;
use App\Policies\QuoteItemPolicy;
use App\Policies\ProductionOrderPolicy;
use App\Policies\SettingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Product::class => ProductPolicy::class,
        Customer::class => CustomerPolicy::class,
        Quote::class => QuotePolicy::class,
        QuoteItem::class => QuoteItemPolicy::class,
        ProductionOrder::class => ProductionOrderPolicy::class,
        Setting::class => SettingPolicy::class,
    ];

    public function boot(): void
    {
        
    }
}