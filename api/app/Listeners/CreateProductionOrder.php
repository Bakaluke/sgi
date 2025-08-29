<?php

namespace App\Listeners;

use App\Events\QuoteApproved;
use App\Models\ProductionOrder;
use App\Models\ProductionStatus;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateProductionOrder
{
    public function __construct() {
        //
    }

    public function handle(QuoteApproved $event): void
    {
        $quote = $event->quote;

        if (ProductionOrder::where('quote_id', $quote->id)->exists()) {
            return;
        }

        $pendingStatus = ProductionStatus::where('name', 'Pendente')->first();

        if (!$pendingStatus) {
            return;
        }

        ProductionOrder::create([
            'quote_id' => $quote->id,
            'customer_id' => $quote->customer_id,
            'user_id' => $quote->user_id,
            'status_id' => $pendingStatus->id,
        ]);
    }
}