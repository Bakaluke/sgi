<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        \App\Models\Plan::create([
            'name' => 'Plano Pro',
            'description' => 'Acesso completo a todos os módulos.',
            'price' => 0
        ]);
    }
}
