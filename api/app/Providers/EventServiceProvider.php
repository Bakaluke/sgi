<?php

namespace App\Providers;

use App\Events\ProductionStarted;
use App\Listeners\DeductProductionMaterials;
use App\Events\OrderCompleted;
use App\Listeners\CreateAccountReceivable;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        OrderCompleted::class => [
            CreateAccountReceivable::class,
        ],
        ProductionStarted::class => [
            DeductProductionMaterials::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}