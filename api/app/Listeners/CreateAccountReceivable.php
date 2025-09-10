<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Models\AccountReceivable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CreateAccountReceivable
{
    public function __construct()
    {
        //
    }

    public function handle(OrderCompleted $event): void
    {
        $order = $event->productionOrder;

        if (AccountReceivable::where('production_order_id', $order->id)->exists()) {
            Log::warning('Tentativa de criar conta a receber duplicada para a Ordem de Produção ID: ' . $order->id);
            return;
        }

        $order->load('quote');

        if (!$order->quote) {
            Log::error('Orçamento relacionado não foi encontrado ao tentar criar conta a receber para a Ordem de Produção ID: ' . $order->id);
            return;
        }
        
        AccountReceivable::create([
            'quote_id' => $order->quote_id,
            'customer_id' => $order->customer_id,
            'production_order_id' => $order->id,
            'total_amount' => $order->quote->total_amount,
            'due_date' => Carbon::now()->addDays(30),
            'status' => 'pending',
        ]);
    }
}