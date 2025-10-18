<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentTerm;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentTermController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', PaymentTerm::class);

        return PaymentTerm::orderBy('name', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', PaymentTerm::class);

        $validated = $request->validate(['name' => 'required|string|unique:payment_terms,name']);

        $validated['tenant_id'] = $request->user()->tenant_id;

        $paymentTerm = PaymentTerm::create($validated);

        return response()->json($paymentTerm, 201);
    }

    public function update(Request $request, PaymentTerm $paymentTerm)
    {
        $this->authorize('update', $paymentTerm);

        $validated = $request->validate(['name' => ['required','string', Rule::unique('payment_terms')->ignore($paymentTerm->id)]]);

        $paymentTerm->update($validated);

        return response()->json($paymentTerm);
    }

    public function destroy(PaymentTerm $paymentTerm)
    {
        $this->authorize('delete', $paymentTerm);
        try {
            $paymentTerm->delete();
            return response()->noContent();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json(
                    ['message' => 'Não é possível excluir. Esta condição de pagamento está em uso em um ou mais orçamentos.'], 
                    409
                );
            }
            return response()->json(['message' => 'Ocorreu um erro no banco de dados.'], 500);
        }
    }
}
