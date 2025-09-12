<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use Illuminate\Http\Request;

class AccountReceivableController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', AccountReceivable::class);

        $receivables = AccountReceivable::with(['customer', 'quote'])
            ->latest()
            ->paginate(30);

        return $receivables;
    }

    public function registerPayment(Request $request, AccountReceivable $accountReceivable)
    {
        $this->authorize('registerPayment', $accountReceivable);

        $validated = $request->validate([
            'paid_amount' => 'required|numeric|min:0.01',
            'paid_at' => 'required|date',
        ]);

        $newPaidAmount = $accountReceivable->paid_amount + $validated['paid_amount'];

        $newStatus = 'partially_paid';
        if ($newPaidAmount >= $accountReceivable->total_amount) {
            $newStatus = 'paid';
        }

        $accountReceivable->update([
            'paid_amount' => $newPaidAmount,
            'paid_at' => $validated['paid_at'],
            'status' => $newStatus,
        ]);

        return $accountReceivable->load(['customer', 'quote']);
    }
}