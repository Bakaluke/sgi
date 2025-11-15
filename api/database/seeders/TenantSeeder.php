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
        Tenant::query()->delete();
        $proPlan = Plan::first();

        if (!$proPlan) {
            $this->command->error('Nenhum plano encontrado. Rode o PlanSeeder primeiro.');
            return;
        }

        Tenant::create([
            'plan_id' => $proPlan->id,
            'name' => 'Drav Dev (Master)',
            'status' => 'active',
            'company_fantasy_name' => 'SGI Drav Dev',
            'cnpj' => '00.000.000/0001-00',
            'email' => 'contato@dravdev.com',
            'phone' => '86999999999',
            'street' => 'Rua dos Programadores',
            'number' => '1024',
            'neighborhood' => 'Centro',
            'city' => 'Teresina',
            'state' => 'PI',
            'cep' => '64000-000',
        ]);

        Tenant::create([
            'plan_id' => $proPlan->id,
            'name' => 'Teresina Brindes',
            'status' => 'active',
            'company_fantasy_name' => 'Teresina Brindes Personalizados',
            'cnpj' => '11.111.111/0001-11',
            'email' => 'contato@teresinabrindes.com',
            'phone' => '86988888888',
            'street' => 'Av. Frei Serafim',
            'number' => '2000',
            'neighborhood' => 'Centro',
            'city' => 'Teresina',
            'state' => 'PI',
            'cep' => '64001-000',
        ]);

        Tenant::create([
            'plan_id' => $proPlan->id,
            'name' => 'Padaria Pão Quente',
            'status' => 'trial',
            'company_fantasy_name' => 'Padaria Pão Quente do Zé',
            'cnpj' => '22.222.222/0001-22',
            'email' => 'contato@padariadoze.com',
            'phone' => '86977777777',
            'street' => 'Rua das Flores',
            'number' => '500',
            'neighborhood' => 'Primavera',
            'city' => 'Teresina',
            'state' => 'PI',
            'cep' => '64002-000',
        ]);
    }
}
