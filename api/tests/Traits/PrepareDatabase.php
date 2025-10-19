<?php

namespace Tests\Traits;

use Illuminate\Contracts\Console\Kernel;

trait PrepareDatabase
{
    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        $app = require __DIR__.'/../../bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();

        \Illuminate\Support\Facades\Artisan::call('migrate:fresh --seed');
    }
}