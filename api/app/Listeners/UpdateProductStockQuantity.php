<?php

namespace App\Listeners;

use App\Events\StockMovementCreated;
use App\Models\StockMovement;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class UpdateProductStockQuantity
{
    public function __construct()
    {
        
    }

    public function handle(StockMovementCreated $event): void
    {
        $product = $event->stockMovement->product;

        $newStockQuantity = StockMovement::where('product_id', $product->id)->sum('quantity');

        $product->quantity_in_stock = $newStockQuantity;
        $product->save();
    }
}
