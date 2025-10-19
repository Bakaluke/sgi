<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReceivableInstallment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceivableInstallmentController extends Controller
{
    public function registerPayment(Request $request, ReceivableInstallment $installment)
    {
        $this->authorize('registerPayment', $installment);

        $validated = $request->validate([
            'paid_at' => 'required|date',
        ]);

        DB::transaction(function () use ($installment, $validated) {
            $installment->update([
                'status' => 'paid',
                'paid_at' => $validated['paid_at'],
            ]);

            $accountReceivable = $installment->accountReceivable;
            $accountReceivable->increment('paid_amount', $installment->amount);

            $allPaid = $accountReceivable->installments()->where('status', '!=', 'paid')->doesntExist();

            if ($allPaid) {
                $accountReceivable->status = 'paid';
            } else {
                $accountReceivable->status = 'partially_paid';
            }
            $accountReceivable->save();
        });

        return $installment->accountReceivable->fresh(['customer', 'quote', 'installments']);
    }
}