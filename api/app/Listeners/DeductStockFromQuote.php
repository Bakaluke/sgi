<?php

namespace App\Listeners;

use App\Events\QuoteApproved;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DeductStockFromQuote
{
    public function __construct()
    {
        //
    }

    public function handle(QuoteApproved $event): void
    {
        $quote = $event->quote;

        DB::transaction(function () use ($quote) {
            foreach ($quote->items as $item) {
                $item->product->decrement('quantity_in_stock', $item->quantity);
            }
        });
    }
}
