<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;

class ProductionOrderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProductionOrder::class);

        $user = $request->user();
        
        $query = ProductionOrder::with(['customer', 'user', 'quote.items.product', 'status']);

        if ($user->role === 'vendedor') {
            $query->where('user_id', $user->id);
        }

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                ->orWhere('status', 'like', "%{$searchTerm}%")
                ->orWhereHas('customer', function ($subQ) use ($searchTerm) {
                    $subQ->where('name', 'like', "%{$searchTerm}%");
                });
            });
        }

        $query->latest();

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        //
    }

    public function show(ProductionOrder $productionOrder)
    {
        //
    }

    public function update(Request $request, ProductionOrder $productionOrder)
    {
        $this->authorize('update', $productionOrder);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['Pendente', 'Em Produção', 'Concluído'])],
        ]);

        $productionOrder->update($validated);

        if ($validated['status'] === 'Concluído' && is_null($productionOrder->completed_at)) {
            $productionOrder->completed_at = now();
            $productionOrder->save();
        }
        
        return $productionOrder->load(['customer', 'user', 'quote.items.product', 'status']);
    }

    public function destroy(ProductionOrder $productionOrder)
    {
        $this->authorize('delete', $productionOrder);
        $productionOrder->delete();
        return response()->noContent();
    }

    public function generateWorkOrderPdf(ProductionOrder $productionOrder)
    {
        $productionOrder->load(['customer', 'quote.items.product']);
        $pdf = Pdf::loadView('pdf.work_order', ['order' => $productionOrder]);
        return $pdf->stream('ordem-de-servico-'.$productionOrder->id.'.pdf');
    }

    public function generateDeliveryProtocolPdf(ProductionOrder $productionOrder)
    {
        $productionOrder->load(['customer', 'quote.items.product']);
        $pdf = Pdf::loadView('pdf.delivery_protocol', ['order' => $productionOrder]);
        return $pdf->stream('protocolo-de-entrega-'.$productionOrder->id.'.pdf');
    }
}
