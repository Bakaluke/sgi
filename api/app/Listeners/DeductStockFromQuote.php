<?php

namespace App\Listeners;

use App\Events\QuoteApproved;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DeductStockFromQuote
{
    public function __construct()
    {
        //
    }

    public function handle(QuoteApproved $event): void
    {
        $quote = $event->quote;
        
        $quote->load('items.product');

        DB::transaction(function () use ($quote) {
            foreach ($quote->items as $item) {
                if ($item->product->isProduct()) {
                    StockMovement::create([
                        'tenant_id' => $quote->tenant_id,
                        'product_id' => $item->product_id,
                        'quantity' => -$item->quantity,
                        'type' => 'venda',
                        'notes' => "Saída referente ao Orçamento Nº {$quote->id}",
                    ]);
                }
            }
        });
    }
}
