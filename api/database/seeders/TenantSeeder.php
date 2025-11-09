<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $proPlan = Plan::first();

        if (!$proPlan) {
            $this->command->error('Nenhum plano encontrado. Rode o PlanSeeder primeiro.');
            return;
        }

        Tenant::create([
            'plan_id' => $proPlan->id,
            'name' => 'Drav Dev',
            'status' => 'active',
            'legal_name' => 'Drav Desenvolvimento de Sistemas Ltda',
            'company_fantasy_name' => 'Drav Dev',
            'cnpj' => '12345678000199',
            'email' => 'contato@dravdev.com.br',
            'phone' => '86999998888',
            'website' => 'dravdev.com.br',
            'cep' => '64000000',
            'street' => 'Rua dos Programadores',
            'number' => '1024',
            'neighborhood' => 'Centro',
            'city' => 'Teresina',
            'state' => 'PI',
        ]);
    }
}
