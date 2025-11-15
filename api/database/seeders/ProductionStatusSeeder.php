<?php

namespace Database\Seeders;

use App\Models\ProductionStatus;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductionStatusSeeder extends Seeder
{
    public function run(): void
    {
        ProductionStatus::query()->delete();

        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            ProductionStatus::create(['tenant_id' => $tenant->id, 'name' => 'Pendente', 'color' => 'blue']);
            ProductionStatus::create(['tenant_id' => $tenant->id, 'name' => 'Em Produção', 'color' => 'yellow']);
            ProductionStatus::create(['tenant_id' => $tenant->id, 'name' => 'Concluído', 'color' => 'green']);
            ProductionStatus::create(['tenant_id' => $tenant->id, 'name' => 'Cancelado', 'color' => 'red']);
        }
    }
}
