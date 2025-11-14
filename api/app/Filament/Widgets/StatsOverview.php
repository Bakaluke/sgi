<?php

namespace App\Filament\Widgets;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total de Empresas (Tenants)', Tenant::count())
                ->description('Total de clientes ativos e inativos')
                ->icon('heroicon-o-building-office-2'),
                
            Stat::make('Total de Usuários', User::withoutGlobalScopes()->count())
                ->description('Usuários em todas as empresas')
                ->icon('heroicon-o-users'),
            
            Stat::make('Total de Planos', Plan::count())
                ->description('Planos de assinatura disponíveis')
                ->icon('heroicon-o-rectangle-stack'),
        ];
    }
}