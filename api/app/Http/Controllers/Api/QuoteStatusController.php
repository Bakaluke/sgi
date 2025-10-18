<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuoteStatus;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuoteStatusController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', QuoteStatus::class);

        return QuoteStatus::orderBy('id', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', QuoteStatus::class);

        $validated = $request->validate(['name' => 'required|string|unique:quote_statuses,name']);

        $validated['tenant_id'] = $request->user()->tenant_id;

        $quoteStatus = QuoteStatus::create($validated);

        return response()->json($quoteStatus, 201);
    }

    public function update(Request $request, QuoteStatus $quoteStatus)
    {
        $this->authorize('update', $quoteStatus);

        $validated = $request->validate(['name' => ['required','string', Rule::unique('quote_statuses')->ignore($quoteStatus->id)]]);

        $quoteStatus->update($validated);

        return response()->json($quoteStatus);
    }

    public function destroy(QuoteStatus $quoteStatus)
    {
        $this->authorize('delete', $quoteStatus);
        
        try {
            $quoteStatus->delete();
            return response()->noContent();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json(
                    ['message' => 'Não é possível excluir. Esta opção de status está em uso em um ou mais orçamentos.'], 
                    409
                );
            }
            return response()->json(['message' => 'Ocorreu um erro no banco de dados.'], 500);
        }
    }
}
