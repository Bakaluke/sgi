<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryMethod;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeliveryMethodController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', DeliveryMethod::class);
        return DeliveryMethod::orderBy('name', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', DeliveryMethod::class);
        $validated = $request->validate(['name' => 'required|string|unique:delivery_methods,name']);
        $deliveryMethod = DeliveryMethod::create($validated);
        return response()->json($deliveryMethod, 201);
    }

    public function update(Request $request, DeliveryMethod $deliveryMethod)
    {
        $this->authorize('update', $deliveryMethod);
        $validated = $request->validate(['name' => ['required','string', Rule::unique('delivery_methods')->ignore($deliveryMethod->id)]]);
        $deliveryMethod->update($validated);
        return response()->json($deliveryMethod);
    }

    public function destroy(DeliveryMethod $deliveryMethod)
    {
        $this->authorize('delete', $deliveryMethod);
        try {
            $deliveryMethod->delete();
            return response()->noContent();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json(
                    ['message' => 'Não é possível excluir. Esta opção de entrega está em uso em um ou mais orçamentos.'], 
                    409
                );
            }
            return response()->json(['message' => 'Ocorreu um erro no banco de dados.'], 500);
        }
    }
}