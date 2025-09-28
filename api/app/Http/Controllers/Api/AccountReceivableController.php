<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use App\Models\ReceivableInstallment;
use Illuminate\Http\Request;

class AccountReceivableController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AccountReceivable::class);

        $query = AccountReceivable::query();

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->whereHas('customer', function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%");
            })->orWhereHas('quote', function($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%");
            });
        }

        $query->with(['customer', 'quote', 'installments']);

        $receivables = $query->latest()->paginate(30);

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

        $fileName = 'contas_a_receber_detalhado.csv';

        $installments = ReceivableInstallment::with(['accountReceivable.customer', 'accountReceivable.quote'])->get();

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($installments) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

            $columns = ['ID Venda', 'Cliente', 'Parcela', 'Vencimento', 'Valor da Parcela', 'Status', 'Data Pagamento'];
            fputcsv($file, $columns, ';');

            foreach ($installments as $item) {
                $row = [
                    $item->accountReceivable->quote_id,
                    $item->accountReceivable->customer->name,
                    "'" . $item->installment_number . '/' . $item->accountReceivable->installments->count(),
                    (new \DateTime($item->due_date))->format('d/m/Y'),
                    number_format($item->amount, 2, ',', '.'),
                    $item->getTranslatedStatus(),
                    $item->paid_at ? (new \DateTime($item->paid_at))->format('d/m/Y') : 'N/A',
                ];
                fputcsv($file, $row, ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}