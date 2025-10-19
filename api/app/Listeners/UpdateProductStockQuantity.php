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
        //
    }

    public function handle(StockMovementCreated $event): void
    {
        $product = $event->stockMovement->product;

        $newStockQuantity = StockMovement::where('product_id', $product->id)->sum('quantity');

        $revertedMovementIds = StockMovement::where('type', 'Ajuste - Estorno')
            ->where('notes', 'like', 'Estorno da movimentação ID #%')
            ->get()
            ->map(function ($movement) {
                return (int) str_replace('Estorno da movimentação ID #', '', $movement->notes);
            });

        $lastPurchase = StockMovement::where('product_id', $product->id)
        ->whereIn('type', ['Compra/Reposição', 'Entrada Inicial'])
        ->whereNotNull('cost_price')
        ->whereNotIn('id', $revertedMovementIds)
        ->latest()
        ->first();

        $newCostPrice = $lastPurchase ? $lastPurchase->cost_price : 0;

        $product->update([
            'quantity_in_stock' => $newStockQuantity,
            'cost_price' => $newCostPrice,
        ]);
    }
}
