<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductionOrder;
use App\Models\Quote;
use App\Models\QuoteStatus;
use App\Models\ProductionStatus;
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

        $isSalesperson = !$user->can('quotes.view_all');

        $quotesQuery = Quote::query()
            ->whereBetween('quotes.created_at', [$startDate, $endDate]);

        if ($isSalesperson) {
            $quotesQuery->where('quotes.user_id', $user->id);
        }

        $ordersQuery = ProductionOrder::query()
            ->whereBetween('production_orders.created_at', [$startDate, $endDate]);

        if ($isSalesperson) {
            $ordersQuery->whereHas('quote', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $approvedValue = (clone $quotesQuery)
            ->whereHas('status', fn($q) => $q->where('name', 'Aprovado'))
            ->sum('quotes.total_amount');

        $forecastValue = (clone $quotesQuery)
            ->whereHas('status', fn($q) => $q->where('name', 'Negociação'))
            ->sum('quotes.total_amount');

        $approvedCount = (clone $quotesQuery)
            ->whereHas('status', fn($q) => $q->where('name', 'Aprovado'))
            ->count();
            
        $averageTicket = $approvedCount > 0 ? $approvedValue / $approvedCount : 0;

        $allQuoteStatuses = QuoteStatus::all(); 
        $quoteStatsCounts = (clone $quotesQuery)
            ->select('status_id', DB::raw('count(*) as total'))
            ->groupBy('status_id')
            ->pluck('total', 'status_id');

        $quoteStats = [
            'statuses' => $allQuoteStatuses->map(fn($s) => ['name' => $s->name, 'color' => $s->color]),
            'counts' => $allQuoteStatuses->mapWithKeys(fn($s) => [
                $s->name => $quoteStatsCounts[$s->id] ?? 0
            ]),
        ];

        $allOrderStatuses = ProductionStatus::all();
        $orderStatsCounts = (clone $ordersQuery)
            ->select('status_id', DB::raw('count(*) as total'))
            ->groupBy('status_id')
            ->pluck('total', 'status_id');

        $orderStats = [
            'statuses' => $allOrderStatuses->map(fn($s) => ['name' => $s->name, 'color' => $s->color]),
            'counts' => $allOrderStatuses->mapWithKeys(fn($s) => [
                $s->name => $orderStatsCounts[$s->id] ?? 0
            ]),
        ];

        $quotesOverTime = (clone $quotesQuery)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => Carbon::parse($item->date)->format('d/m'),
                'count' => $item->count
            ]);

        $lowStockProducts = [];
        $staleQuotes = [];
        $topSellingProducts = [];
        $salespersonRanking = [];

        if (!$isSalesperson) {
            $lowStockProducts = Product::where('type', 'produto')
                ->where('quantity_in_stock', '<=', 10)
                ->orderBy('quantity_in_stock', 'asc')
                ->limit(5)
                ->get(['id', 'name', 'quantity_in_stock']);

            $staleQuotes = Quote::query()
                 ->whereHas('status', fn($q) => $q->whereIn('name', ['Aberto', 'Negociação']))
                 ->where('created_at', '<', now()->subDays(7))
                 ->with('customer:id,name')
                 ->limit(5)
                 ->get();

             $topSellingProducts = QuoteItem::query()
                ->join('quotes', 'quote_items.quote_id', '=', 'quotes.id')
                ->join('products', 'quote_items.product_id', '=', 'products.id')
                ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
                ->where('quote_statuses.name', 'Aprovado')
                ->whereBetween('quotes.created_at', [$startDate, $endDate])
                ->select('products.name as product_name', DB::raw('SUM(quote_items.quantity) as total_quantity'))
                ->groupBy('products.name')
                ->orderByDesc('total_quantity')
                ->limit(5)
                ->get();
                
             $salespersonRanking = Quote::query()
                ->join('users', 'quotes.user_id', '=', 'users.id')
                ->join('quote_statuses', 'quotes.status_id', '=', 'quote_statuses.id')
                ->where('quote_statuses.name', 'Aprovado')
                ->whereBetween('quotes.created_at', [$startDate, $endDate])
                ->select('users.name as salesperson_name', 
                    DB::raw('COUNT(quotes.id) as total_sales'), 
                    DB::raw('SUM(quotes.total_amount) as total_value')
                )
                ->groupBy('users.id', 'users.name')
                ->orderByDesc('total_value')
                ->limit(5)
                ->get();
        }

        return response()->json([
            'kpis' => [
                'approvedValue' => $approvedValue,
                'forecastValue' => $forecastValue,
                'averageTicket' => $averageTicket,
            ],
            'quoteStats' => $quoteStats,
            'orderStats' => $orderStats,
            'quotesOverTime' => $quotesOverTime,
            'lowStockProducts' => $lowStockProducts,
            'staleQuotes' => $staleQuotes,
            'topSellingProducts' => $topSellingProducts,
            'salespersonRanking' => $salespersonRanking,
        ]);
    }
}