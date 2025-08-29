<?php

namespace Database\Seeders;

use App\Models\ProductionStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductionStatusSeeder extends Seeder
{
    public function run(): void
    {
        ProductionStatus::create(['name' => 'Pendente', 'color' => 'blue']);
        ProductionStatus::create(['name' => 'Em Produção', 'color' => 'yellow']);
        ProductionStatus::create(['name' => 'Concluído', 'color' => 'green']);
    }
}
