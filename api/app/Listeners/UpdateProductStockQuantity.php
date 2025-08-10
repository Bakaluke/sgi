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
        $movement = $event->stockMovement;
        $product = $movement->product;

        $newStockQuantity = StockMovement::where('product_id', $product->id)->sum('quantity');

        $updateData = [
            'quantity_in_stock' => $newStockQuantity,
        ];

        if ($movement->quantity > 0 && is_numeric($movement->cost_price)) {
            $updateData['cost_price'] = $movement->cost_price;
        }

        $product->update($updateData);
    }
}
