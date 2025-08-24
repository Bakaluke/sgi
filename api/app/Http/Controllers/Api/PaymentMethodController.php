<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', PaymentMethod::class);
        return PaymentMethod::orderBy('name', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', PaymentMethod::class);
        $validated = $request->validate(['name' => 'required|string|unique:payment_methods,name']);
        $paymentMethod = PaymentMethod::create($validated);
        return response()->json($paymentMethod, 201);
    }

    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $this->authorize('update', $paymentMethod);
        $validated = $request->validate(['name' => ['required','string', Rule::unique('payment_methods')->ignore($paymentMethod->id)]]);
        $paymentMethod->update($validated);
        return response()->json($paymentMethod);
    }

    public function destroy(PaymentMethod $paymentMethod)
    {
        $this->authorize('delete', $paymentMethod);
        try {
            $paymentMethod->delete();
            return response()->noContent();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json(
                    ['message' => 'Não é possível excluir. Esta forma de pagamento está em uso em um ou mais orçamentos.'], 
                    409
                );
            }
            return response()->json(['message' => 'Ocorreu um erro no banco de dados.'], 500);
        }
    }
}