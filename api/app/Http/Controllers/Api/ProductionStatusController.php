<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionStatus;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductionStatusController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', ProductionStatus::class);

        return ProductionStatus::orderBy('id', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', ProductionStatus::class);

        $validated = $request->validate(['name' => 'required|string|unique:production_statuses,name']);

        $validated['tenant_id'] = $request->user()->tenant_id;

        $productionStatus = ProductionStatus::create($validated);

        return response()->json($productionStatus, 201);
    }

    public function update(Request $request, ProductionStatus $productionStatus)
    {
        $this->authorize('update', $productionStatus);

        $validated = $request->validate(['name' => ['required','string', Rule::unique('production_statuses')->ignore($productionStatus->id)]]);

        $productionStatus->update($validated);

        return response()->json($productionStatus);
    }

    public function destroy(ProductionStatus $productionStatus)
    {
        $this->authorize('delete', $productionStatus);
        try {
            $productionStatus->delete();
            return response()->noContent();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json(
                    ['message' => 'Não é possível excluir. Esta opção de status está em uso em uma ou mais produções.'], 
                    409
                );
            }
            return response()->json(['message' => 'Ocorreu um erro no banco de dados.'], 500);
        }
    }
}
