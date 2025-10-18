<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NegotiationSource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NegotiationSourceController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', NegotiationSource::class);

        return NegotiationSource::orderBy('name', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', NegotiationSource::class);

        $validated = $request->validate(['name' => 'required|string|unique:negotiation_sources,name']);

        $validated['tenant_id'] = $request->user()->tenant_id;

        $negotiationSource = NegotiationSource::create($validated);

        return response()->json($negotiationSource, 201);
    }

    public function update(Request $request, NegotiationSource $negotiationSource)
    {
        $this->authorize('update', $negotiationSource);

        $validated = $request->validate(['name' => ['required','string', Rule::unique('negotiation_sources')->ignore($negotiationSource->id)]]);

        $negotiationSource->update($validated);

        return response()->json($negotiationSource);
    }

    public function destroy(NegotiationSource $negotiationSource)
    {
        $this->authorize('delete', $negotiationSource);
        try {
            $negotiationSource->delete();
            return response()->noContent();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1451) {
                return response()->json(
                    ['message' => 'Não é possível excluir. Esta opção de negociação está em uso em um ou mais orçamentos.'], 
                    409
                );
            }
            return response()->json(['message' => 'Ocorreu um erro no banco de dados.'], 500);
        }
    }
}