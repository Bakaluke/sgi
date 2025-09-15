<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use Illuminate\Http\Request;

class AccountReceivableController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', AccountReceivable::class);

        $receivables = AccountReceivable::with(['customer', 'quote'])
            ->latest()
            ->paginate(30);

        return $receivables;
    }

    public function registerPayment(Request $request, AccountReceivable $accountReceivable)
    {
        $this->authorize('registerPayment', $accountReceivable);

        $validated = $request->validate([
            'paid_amount' => 'required|numeric|min:0.01',
            'paid_at' => 'required|date',
        ]);

        $newPaidAmount = $accountReceivable->paid_amount + $validated['paid_amount'];

        $newStatus = 'partially_paid';
        if ($newPaidAmount >= $accountReceivable->total_amount) {
            $newStatus = 'paid';
        }

        $accountReceivable->update([
            'paid_amount' => $newPaidAmount,
            'paid_at' => $validated['paid_at'],
            'status' => $newStatus,
        ]);

        return $accountReceivable->load(['customer', 'quote']);
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', AccountReceivable::class);

        $fileName = 'contas_a_receber.csv';
        $receivables = AccountReceivable::with(['customer', 'quote'])->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($receivables) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

            $columns = ['ID', 'Cliente', 'Orçamento Nº', 'Valor Total', 'Valor Pago', 'Vencimento', 'Data Pagamento', 'Status'];
            fputcsv($file, $columns, ';');

            foreach ($receivables as $item) {
                $row = [
                    $item->id,
                    $item->customer->name,
                    $item->quote->id,
                    number_format($item->total_amount, 2, ',', '.'),
                    number_format($item->paid_amount, 2, ',', '.'),
                    (new \DateTime($item->due_date))->format('d/m/Y'),
                    $item->paid_at ? (new \DateTime($item->paid_at))->format('d/m/Y') : 'N/A',
                    $item->status,
                ];
                fputcsv($file, $row, ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}