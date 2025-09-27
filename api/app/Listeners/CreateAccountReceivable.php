<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Models\AccountReceivable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CreateAccountReceivable
{
    public function handle(OrderCompleted $event): void
    {
        $order = $event->productionOrder;

        $order->load('quote.paymentTerm');
        
        if (AccountReceivable::where('production_order_id', $order->id)->exists()) { return; }
        if (!$order->quote || !$order->quote->paymentTerm) {
            Log::error('Condição de Pagamento não encontrada para o Orçamento ID: ' . $order->quote_id);
            return;
        }
        
        $paymentTerm = $order->quote->paymentTerm;
        
        $accountReceivable = AccountReceivable::create([
            'quote_id' => $order->quote_id,
            'customer_id' => $order->customer_id,
            'production_order_id' => $order->id,
            'total_amount' => $order->quote->total_amount,
            'due_date' => Carbon::now()->addDays($paymentTerm->days_for_first_installment),
            'status' => 'pending',
        ]);

        $installmentAmount = round($order->quote->total_amount / $paymentTerm->number_of_installments, 2);
        
        $dueDate = Carbon::now()->addDays($paymentTerm->days_for_first_installment);

        for ($i = 1; $i <= $paymentTerm->number_of_installments; $i++) {
            $accountReceivable->installments()->create([
                'installment_number' => $i,
                'amount' => $installmentAmount,
                'due_date' => $dueDate,
            ]);
            $dueDate->addDays($paymentTerm->days_between_installments);
        }
    }
}