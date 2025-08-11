<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StockMovementController extends Controller
{
    public function store(Request $request)
    {
        if (!in_array($request->user()->role, ['admin', 'producao'])) {
            abort(403, 'Ação não autorizada.');
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|not_in:0',
            'type' => ['required', Rule::in([
                'Entrada Inicial',
                'Compra/Reposição',
                'Perda de Produção',
                'Defeito de Fabricação',
                'Ajuste Manual - Entrada',
                'Ajuste Manual - Saída',
                'Ajuste - Estorno',
            ])],
            'notes' => 'nullable|string',
            'cost_price' => 'nullable|numeric|min:0',
        ]);

        $quantity = $validated['quantity'];

        $type = $validated['type'];
        
        $exitTypes = ['Perda de Produção', 'Defeito de Fabricação', 'Ajuste Manual - Saída'];
        if (in_array($type, $exitTypes)) {
            $quantity = -$quantity;
        }

        $movement = StockMovement::create([
            'product_id' => $validated['product_id'],
            'quantity' => $quantity,
            'type' => $type,
            'notes' => $validated['notes'] ?? null,
            'cost_price' => $validated['cost_price'] ?? null,
        ]);

        return response()->json($movement, 201);
    }

    public function history(Request $request, Product $product)
    {
        $this->authorize('viewStockHistory', $product);

        $movements = $product->stockMovements()->latest()->get();

        return response()->json($movements);
    }
}