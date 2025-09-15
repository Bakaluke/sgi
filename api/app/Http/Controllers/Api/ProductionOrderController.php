<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCompleted;
use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use App\Models\Setting;
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

        $oldStatusName = $productionOrder->status?->name;

        $validated = $request->validate([
            'status_id' => 'required|exists:production_statuses,id',
        ]);

        $productionOrder->update($validated);

        $productionOrder->refresh();
        $newStatusName = $productionOrder->status?->name;

        if ($productionOrder->status->name === 'Concluído' && is_null($productionOrder->completed_at)) {
            $productionOrder->completed_at = now();
            $productionOrder->save();
        }

        if ($oldStatusName !== 'Concluído' && $newStatusName === 'Concluído') {
            OrderCompleted::dispatch($productionOrder);
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
        $productionOrder->load(['customer', 'user', 'quote.items.product']);
        
        $settings = Setting::first();
        
        $pdf = Pdf::loadView('pdf.work_order', [
            'order' => $productionOrder,
            'settings' => $settings 
        ]);
        
        return $pdf->stream('ordem-de-servico-'.$productionOrder->id.'.pdf');
    }

    public function generateDeliveryProtocolPdf(ProductionOrder $productionOrder)
    {
        $productionOrder->load(['customer', 'user', 'quote.items.product']);
        $settings = Setting::first();

        $pdf = Pdf::loadView('pdf.delivery_protocol', [
            'order' => $productionOrder,
            'settings' => $settings 
        ]);

        return $pdf->stream('protocolo-de-entrega-'.$productionOrder->id.'.pdf');
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', ProductionOrder::class);

        $user = $request->user();
        $fileName = 'ordens_de_producao.csv';

        $query = ProductionOrder::query();
        if (!$user->can('production_orders.view_all')) {
            $query->where('user_id', $user->id);
        }
        $orders = $query->with(['customer', 'user', 'status'])->get();

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($orders) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

            $columns = ['Nº Pedido', 'Nº Orçamento', 'Cliente', 'Vendedor', 'Status', 'Data do Pedido'];
            fputcsv($file, $columns, ';');

            foreach ($orders as $order) {
                $row = [
                    $order->id,
                    $order->quote_id,
                    $order->customer->name,
                    $order->user->name,
                    $order->status?->name ?? 'N/A',
                    (new \DateTime($order->created_at))->format('d/m/Y'),
                ];
                fputcsv($file, $row, ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
