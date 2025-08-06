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

        $formatStats = function ($queryResult) {
            $stats = ['Aberto' => 0, 'Negociação' => 0, 'Aprovado' => 0, 'Cancelado' => 0, 'Pendente' => 0, 'Em Produção' => 0, 'Concluído' => 0];
            foreach ($queryResult as $result) {
                $stats[$result->status] = $result->total;
            }
            return $stats;
        };

        switch ($user->role) {
            case 'admin':
                $quoteStatsQuery = Quote::query()
                    ->select('status', DB::raw('count(*) as total'))
                    ->groupBy('status')->get();
                $orderStatsQuery = ProductionOrder::query()
                    ->select('status', DB::raw('count(*) as total'))
                    ->groupBy('status')->get();

                $quoteStats = $formatStats($quoteStatsQuery);
                $orderStats = $formatStats($orderStatsQuery);
                break;

            case 'vendedor':
                $quoteStatsQuery = Quote::where('user_id', $user->id)
                    ->select('status', DB::raw('count(*) as total'))
                    ->groupBy('status')->get();
                $orderStatsQuery = ProductionOrder::where('user_id', $user->id)
                    ->select('status', DB::raw('count(*) as total'))
                    ->groupBy('status')->get();

                $quoteStats = $formatStats($quoteStatsQuery);
                $orderStats = $formatStats($orderStatsQuery);
                break;

            case 'producao':
                $orderStatsQuery = ProductionOrder::query()
                    ->select('status', DB::raw('count(*) as total'))
                    ->groupBy('status')->get();

                $orderStats = $formatStats($orderStatsQuery);
                break;
        }

        return response()->json([
            'quoteStats' => $quoteStats,
            'orderStats' => $orderStats,
        ]);
    }
}