<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountPayable;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AccountPayableController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AccountPayable::class);

        $query = AccountPayable::query();

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where('description', 'like', "%{$searchTerm}%")
                  ->orWhere('supplier', 'like', "%{$searchTerm}%");
        }

        return $query->latest()->paginate(30);
    }

    public function store(Request $request)
    {
        $this->authorize('create', AccountPayable::class);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
        ]);

        $accountPayable = AccountPayable::create($validated);

        return response()->json($accountPayable, 201);
    }

    public function update(Request $request, AccountPayable $accountPayable)
    {
        $this->authorize('update', $accountPayable);

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'total_amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
        ]);

        $accountPayable->update($validated);

        return response()->json($accountPayable);
    }

    public function destroy(AccountPayable $accountPayable)
    {
        $this->authorize('delete', $accountPayable);
        $accountPayable->delete();
        return response()->noContent();
    }

    public function registerPayment(Request $request, AccountPayable $accountPayable)
    {
        $this->authorize('registerPayment', $accountPayable);

        $validated = $request->validate([
            'paid_amount' => 'required|numeric|min:0.01',
            'paid_at' => 'required|date',
        ]);

        $newPaidAmount = $accountPayable->paid_amount + $validated['paid_amount'];
        $newStatus = ($newPaidAmount >= $accountPayable->total_amount) ? 'paid' : 'partially_paid';

        $accountPayable->update([
            'paid_amount' => $newPaidAmount,
            'paid_at' => $validated['paid_at'],
            'status' => $newStatus,
        ]);

        return $accountPayable;
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', AccountPayable::class);

        $fileName = 'contas_a_pagar.csv';
        $payables = AccountPayable::all();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($payables) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

            $columns = ['ID', 'Descrição', 'Fornecedor', 'Valor Total', 'Valor Pago', 'Vencimento', 'Data Pagamento', 'Status'];
            fputcsv($file, $columns, ';');

            foreach ($payables as $item) {
                $row = [
                    $item->id,
                    $item->description,
                    $item->supplier ?? 'N/A',
                    number_format($item->total_amount, 2, ',', '.'),
                    number_format($item->paid_amount, 2, ',', '.'),
                    $item->due_date->format('d/m/Y'),
                    $item->paid_at ? $item->paid_at->format('d/m/Y') : 'N/A',
                    $item->status,
                ];
                fputcsv($file, $row, ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}