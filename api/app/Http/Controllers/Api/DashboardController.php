<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use App\Models\Quote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        $quoteStats = [];
        $orderStats = [];
        $quotesOverTime = [];

        $formatStats = function ($queryResult) {
            $stats = ['Aberto' => 0, 'Negociação' => 0, 'Aprovado' => 0, 'Cancelado' => 0, 'Pendente' => 0, 'Em Produção' => 0, 'Concluído' => 0];
            foreach ($queryResult as $result) {
                $stats[$result->status] = $result->total;
            }
            return $stats;
        };

        $baseQuoteQuery = Quote::query();
        if ($user->role === 'vendedor') {
            $baseQuoteQuery->where('user_id', $user->id);
        }

        $baseOrderQuery = ProductionOrder::query();
        if ($user->role === 'vendedor') {
            $baseOrderQuery->where('user_id', $user->id);
        }

        if (in_array($user->role, ['admin', 'vendedor'])) {
            $quoteStatsQuery = (clone $baseQuoteQuery)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')->get();
            $quoteStats = $formatStats($quoteStatsQuery);

            $quotesOverTime = (clone $baseQuoteQuery)
                ->where('created_at', '>=', now()->subDays(6))
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get([
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('count(*) as count')
                ])
                ->map(function ($item) {
                    $item->date = (new \DateTime($item->date))->format('d/m');
                    return $item;
                });
        }

        if (in_array($user->role, ['admin', 'vendedor', 'producao'])) {
            $orderStatsQuery = (clone $baseOrderQuery)
                ->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')->get();
            $orderStats = $formatStats($orderStatsQuery);
        }

        return response()->json([
            'quoteStats' => $quoteStats,
            'orderStats' => $orderStats,
            'quotesOverTime' => $quotesOverTime,
        ]);
    }
}