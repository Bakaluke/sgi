<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountPayable;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountPayableController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AccountPayable::class);

        $query = AccountPayable::query();

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where('description', 'like', "%{$searchTerm}%")
                  ->orWhere('supplier', 'like', "%{$searchTerm}%");
        }

        return $query->latest()->paginate(30);
    }

    public function store(Request $request)
    {
        $this->authorize('create', AccountPayable::class);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
        ]);

        $accountPayable = AccountPayable::create($validated);

        return response()->json($accountPayable, 201);
    }

    public function update(Request $request, AccountPayable $accountPayable)
    {
        $this->authorize('update', $accountPayable);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
        ]);

        $accountPayable->update($validated);

        return response()->json($accountPayable);
    }

    public function destroy(AccountPayable $accountPayable)
    {
        $this->authorize('delete', $accountPayable);
        $accountPayable->delete();
        return response()->noContent();
    }

    public function registerPayment(Request $request, AccountPayable $accountPayable)
    {
        $this->authorize('registerPayment', $accountPayable);

        $validated = $request->validate([
            'paid_amount' => 'required|numeric|min:0.01',
            'paid_at' => 'required|date',
        ]);

        $newPaidAmount = $accountPayable->paid_amount + $validated['paid_amount'];
        $newStatus = ($newPaidAmount >= $accountPayable->total_amount) ? 'paid' : 'partially_paid';

        $accountPayable->update([
            'paid_amount' => $newPaidAmount,
            'paid_at' => $validated['paid_at'],
            'status' => $newStatus,
        ]);

        return $accountPayable;
    }
}