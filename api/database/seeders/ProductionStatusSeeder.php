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

        $masterTenant = Tenant::where('name', 'Drav Dev')->first();

        ProductionStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Pendente', 'color' => 'blue']);
        ProductionStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Em Produção', 'color' => 'yellow']);
        ProductionStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Concluído', 'color' => 'green']);
        ProductionStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Cancelado', 'color' => 'red']);
    }
}
