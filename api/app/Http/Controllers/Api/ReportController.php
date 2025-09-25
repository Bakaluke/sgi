<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\AccountReceivable;
use App\Models\AccountPayable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesByPeriod(Request $request)
    {
        $this->authorize('reports.view');

        $validated = $request->validate([
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
        ]);

        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();

        $approvedQuotes = Quote::query()
            ->whereHas('status', fn($query) => $query->where('name', 'Aprovado'))
            ->whereBetween('updated_at', [$startDate, $endDate]);

        $totalRevenue = $approvedQuotes->sum('total_amount');
        $quoteCount = $approvedQuotes->count();
        $averageTicket = ($quoteCount > 0) ? ($totalRevenue / $quoteCount) : 0;

        return response()->json([
            'total_revenue' => $totalRevenue,
            'quote_count' => $quoteCount,
            'average_ticket' => $averageTicket,
        ]);
    }

    public function salesByCustomer(Request $request)
    {
        $this->authorize('reports.view');

        $validated = $request->validate([
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
        ]);

        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();

        $salesData = Quote::query()
            ->join('customers', 'quotes.customer_id', '=', 'customers.id')
            ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
            ->where('quote_statuses.name', 'Aprovado')
            ->whereBetween('quotes.updated_at', [$startDate, $endDate])
            ->groupBy('customers.id', 'customers.name')
            ->orderBy('total_sold', 'desc')
            ->select(
                'customers.id', 
                'customers.name', 
                DB::raw('SUM(quotes.total_amount) as total_sold'),
                DB::raw('COUNT(quotes.id) as quote_count')
            )
            ->paginate(50);

        return $salesData;
    }

    public function exportSalesByCustomer(Request $request)
    {
        $this->authorize('reports.view');

        $validated = $request->validate([
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
        ]);

        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();

        $salesData = Quote::query()
            ->join('customers', 'quotes.customer_id', '=', 'customers.id')
            ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
            ->where('quote_statuses.name', 'Aprovado')
            ->whereBetween('quotes.updated_at', [$startDate, $endDate])
            ->groupBy('customers.id', 'customers.name')
            ->orderBy('total_sold', 'desc')
            ->select( 'customers.name', DB::raw('SUM(quotes.total_amount) as total_sold'), DB::raw('COUNT(quotes.id) as quote_count') )
            ->get();

        $fileName = 'vendas_por_cliente.csv';
        
        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($salesData) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));
            $columns = ['Cliente', 'Nº de Compras', 'Valor Total Comprado'];
            fputcsv($file, $columns, ';');
            foreach ($salesData as $row) {
                fputcsv($file, [
                    $row->name,
                    $row->quote_count,
                    number_format($row->total_sold, 2, ',', '.'),
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function itemsSoldByDay(Request $request)
    {
        $this->authorize('reports.view');

        $validated = $request->validate([
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
        ]);

        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();

        $itemsSold = QuoteItem::query()
            ->join('quotes', 'quote_items.quote_id', '=', 'quotes.id')
            ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
            ->where('quote_statuses.name', 'Aprovado')
            ->whereBetween('quotes.updated_at', [$startDate, $endDate])
            ->select(
                'quote_items.product_name',
                DB::raw('DATE(quotes.updated_at) as sale_date'),
                DB::raw('SUM(quote_items.quantity) as total_quantity')
            )
            ->groupBy('sale_date', 'quote_items.product_name')
            ->orderBy('sale_date', 'desc')
            ->orderBy('total_quantity', 'desc')
            ->paginate(50);

        return $itemsSold;
    }

    public function exportItemsSoldByDay(Request $request)
    {
        $this->authorize('reports.view');

        $validated = $request->validate([
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
        ]);

        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();

        $itemsSold = QuoteItem::query()
            ->join('quotes', 'quote_items.quote_id', '=', 'quotes.id')
            ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
            ->where('quote_statuses.name', 'Aprovado')
            ->whereBetween('quotes.updated_at', [$startDate, $endDate])
            ->select(
                'quote_items.product_name',
                DB::raw('DATE(quotes.updated_at) as sale_date'),
                DB::raw('SUM(quote_items.quantity) as total_quantity')
            )
            ->groupBy('sale_date', 'quote_items.product_name')
            ->orderBy('sale_date', 'desc')
            ->orderBy('total_quantity', 'desc')
            ->get();

        $fileName = 'itens_vendidos_por_dia.csv';
        
        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($itemsSold) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));
            $columns = ['Data da Venda', 'Produto', 'Quantidade Vendida'];
            fputcsv($file, $columns, ';');
            foreach ($itemsSold as $row) {
                fputcsv($file, [
                    (new \DateTime($row->sale_date))->format('d/m/Y'),
                    $row->product_name,
                    $row->total_quantity,
                ], ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function cashFlow(Request $request)
    {
        $this->authorize('reports.view');

        $receivables = AccountReceivable::query()
            ->where('status', '!=', 'paid')
            ->select(
                DB::raw("DATE_FORMAT(due_date, '%Y-%m') as month"),
                DB::raw("SUM(total_amount - paid_amount) as total")
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy('month');

        $payables = AccountPayable::query()
            ->where('status', '!=', 'paid')
            ->select(
                DB::raw("DATE_FORMAT(due_date, '%Y-%m') as month"),
                DB::raw("SUM(total_amount - paid_amount) as total")
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get()
            ->keyBy('month');

        $months = collect($receivables->keys()->merge($payables->keys())->unique())->sort();

        $data = $months->map(function ($month) use ($receivables, $payables) {
            $formattedMonth = Carbon::createFromFormat('Y-m', $month)->translatedFormat('M/Y');
            return [
                'month' => $formattedMonth,
                'A Receber' => (float) ($receivables->get($month)->total ?? 0),
                'A Pagar' => (float) ($payables->get($month)->total ?? 0),
            ];
        })->values();

        return response()->json($data);
    }

    public function authorize($ability, $arguments = [])
    {
        $request = app(Request::class);
        $user = $request->user();
        if (!$user || !$user->can($ability)) {
            abort(403, 'Ação não autorizada.');
        }
    }
}