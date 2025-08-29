<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\ProductionOrder;
use App\Models\Setting;
use App\Models\User;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\DeliveryMethod;
use App\Models\QuoteStatus;
use App\Models\ProductionStatus;
use App\Policies\ProductPolicy;
use App\Policies\CustomerPolicy;
use App\Policies\QuotePolicy;
use App\Policies\QuoteItemPolicy;
use App\Policies\ProductionOrderPolicy;
use App\Policies\SettingPolicy;
use App\Policies\UserPolicy;
use App\Policies\CategoryPolicy;
use App\Policies\PaymentMethodPolicy;
use App\Policies\DeliveryMethodPolicy;
use App\Policies\QuoteStatusPolicy;
use App\Policies\ProductionStatusPolicy;
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
        User::class => UserPolicy::class,
        Category::class => CategoryPolicy::class,
        PaymentMethod::class => PaymentMethodPolicy::class,
        DeliveryMethod::class => DeliveryMethodPolicy::class,
        QuoteStatus::class => QuoteStatusPolicy::class,
    ];

    public function boot(): void
    {
        
    }
}