<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use App\Models\ProductionStatus;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteStatus;
use App\Models\QuoteItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $validated = $request->validate([
            'startDate' => 'required|date_format:Y-m-d',
            'endDate' => 'required|date_format:Y-m-d|after_or_equal:startDate',
        ]);
        
        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();
        $user = $request->user();

        $response = [
            'quoteStats' => null,
            'orderStats' => null,
            'quotesOverTime' => [],
            'kpis' => [ 'approvedValue' => 0, 'averageTicket' => 0, 'forecastValue' => 0 ],
            'lowStockProducts' => [],
            'staleQuotes' => [],
            'topSellingProducts' => [],
        ];

        $formatCounts = function ($queryResult) {
            $counts = [];
            foreach ($queryResult as $result) {
                $counts[$result->status_name] = $result->total;
            }
            return $counts;
        };

        $baseQuoteQuery = Quote::query()->whereBetween('quotes.created_at', [$startDate, $endDate]);
        if (!$user->can('quotes.view_all')) {
            $baseQuoteQuery->where('user_id', $user->id);
        }

        $baseOrderQuery = ProductionOrder::query()->whereBetween('production_orders.created_at', [$startDate, $endDate]);
        if (!$user->can('production_orders.view_all')) {
            $baseOrderQuery->where('user_id', $user->id);
        }

        $alertsQuoteQuery = Quote::query();
        if (!$user->can('quotes.view_all')) {
            $alertsQuoteQuery->where('user_id', $user->id);
        }

        if ($user->can('quotes.view') || $user->can('quotes.view_all')) {
            $approvedQuotesQuery = (clone $baseQuoteQuery)->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')->where('quote_statuses.name', 'Aprovado');
            $negotiationQuotesQuery = (clone $baseQuoteQuery)->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')->where('quote_statuses.name', 'Negociação');
            
            $approvedValue = (clone $approvedQuotesQuery)->sum('quotes.total_amount');
            $approvedCount = (clone $approvedQuotesQuery)->count();

            $response['kpis']['approvedValue'] = $approvedValue;
            $response['kpis']['averageTicket'] = ($approvedCount > 0) ? ($approvedValue / $approvedCount) : 0;
            $response['kpis']['forecastValue'] = (clone $negotiationQuotesQuery)->sum('quotes.total_amount');

            if ($user->can('quotes.view_all')) {
                $approvedQuotesQuery = (clone $baseQuoteQuery)
                    ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
                    ->where('quote_statuses.name', 'Aprovado');
            }

            $response['quoteStats'] = [
                'counts' => $formatCounts((clone $baseQuoteQuery)
                    ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
                    ->select('quote_statuses.name as status_name', DB::raw('count(quotes.id) as total'))
                    ->groupBy('quote_statuses.name')->get()),
                'statuses' => QuoteStatus::where('is_active', true)->orderBy('name')->get(['name', 'color']),
            ];
            
            $response['quotesOverTime'] = (clone $baseQuoteQuery)
                ->groupBy('date')->orderBy('date', 'ASC')
                ->get([ DB::raw('DATE(quotes.created_at) as date'), DB::raw('count(*) as count') ])
                ->map(fn($item) => ['date' => (new \DateTime($item->date))->format('d/m/Y'), 'count' => $item->count]);
        }
        
        if ($user->can('production_orders.view') || $user->can('production_orders.view_all')) {
            $response['orderStats'] = [
                'counts' => $formatCounts((clone $baseOrderQuery)
                    ->join('production_statuses', 'production_orders.status_id', '=', 'production_statuses.id')
                    ->select('production_statuses.name as status_name', DB::raw('count(production_orders.id) as total'))
                    ->groupBy('production_statuses.name')->get()),
                'statuses' => ProductionStatus::where('is_active', true)->orderBy('name')->get(['name', 'color']),
            ];
        }

        if ($user->can('stock.manage')) {
            $lowStockThreshold = 10;
            $response['lowStockProducts'] = Product::where('type', 'produto')
                ->where('quantity_in_stock', '<=', $lowStockThreshold)
                ->orderBy('quantity_in_stock', 'asc')
                ->limit(5)
                ->get(['id', 'name', 'quantity_in_stock']);
        }

        if ($user->can('quotes.view') || $user->can('quotes.view_all')) {
            $staleThreshold = 7;
            $staleQuotesQuery = (clone $alertsQuoteQuery)
                ->with('customer')
                ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
                ->whereIn('quote_statuses.name', ['Aberto', 'Negociação'])
                ->where('quotes.created_at', '<', now()->subDays($staleThreshold));
            
            $response['staleQuotes'] = $staleQuotesQuery
                ->orderBy('quotes.created_at', 'asc')
                ->limit(5)
                ->get(['quotes.id', 'quotes.customer_id', 'quotes.created_at']);
        }

        if ($user->can('quotes.view_all')) {
            $response['topSellingProducts'] = QuoteItem::query()
                ->join('quotes', 'quote_items.quote_id', '=', 'quotes.id')
                ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
                ->where('quote_statuses.name', 'Aprovado')
                ->whereBetween('quotes.created_at', [$startDate, $endDate])
                ->select('quote_items.product_name', DB::raw('SUM(quote_items.quantity) as total_quantity'))
                ->groupBy('quote_items.product_name')
                ->orderBy('total_quantity', 'desc')
                ->limit(5)
                ->get();
        }

        return response()->json($response);
    }
}