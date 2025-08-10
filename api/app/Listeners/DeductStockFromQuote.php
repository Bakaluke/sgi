<?php

namespace App\Listeners;

use App\Events\QuoteApproved;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class DeductStockFromQuote
{
    public function __construct()
    {
        
    }

    public function handle(QuoteApproved $event): void
    {
        $quote = $event->quote;

        DB::transaction(function () use ($quote) {
            foreach ($quote->items as $item) {
                StockMovement::create([
                    'product_id' => $item->product_id,
                    'quantity' => -$item->quantity,
                    'type' => 'Vendas',
                    'notes' => 'Saída referente ao Orçamento Nº ' . $quote->id,
                ]);

            }
        });
    }
}
