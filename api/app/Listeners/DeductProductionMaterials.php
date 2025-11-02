<?php

namespace App\Listeners;

use App\Models\ProductionOrder;
use App\Models\StockMovement;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DeductProductionMaterials
{
    /**
     * @param  \App\Models\ProductionOrder
     */
    public function handle(ProductionOrder $order): void
    {
        $triggerStatus = 'Em Produção'; 

        if ($order->wasChanged('status_id') && 
            $order->status?->name === $triggerStatus && 
            !$order->materials_deducted_at)
        {
            $order->load('quote.items.product.components.component');

            try {
                DB::transaction(function () use ($order) {
                    foreach ($order->quote->items as $item) {
                        if ($item->product->isService() && $item->product->components->isNotEmpty()) {
                            foreach ($item->product->components as $component) {                                
                                $totalQuantityToDeduct = $item->quantity * $component->quantity_used;
                                StockMovement::create([
                                    'tenant_id' => $order->tenant_id,
                                    'product_id' => $component->component_id,
                                    'quantity' => -$totalQuantityToDeduct,
                                    'type' => 'Saída por Produção',
                                    'notes' => "Baixa de material p/ O.P. Nº {$order->internal_id} (Item: {$item->product_name})",
                                ]);
                            }
                        }
                    }
                    $order->materials_deducted_at = now();
                    $order->saveQuietly();
                });

            } catch (\Exception $e) {
                Log::error("Falha ao dar baixa de material para O.P. ID {$order->id}: " . $e->getMessage());
            }
        }
    }
}