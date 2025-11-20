<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        Tenant::query()->delete();
        $faker = Faker::create('pt_BR');
        $proPlan = Plan::first();

        if (!$proPlan) {
            $this->command->error('Nenhum plano encontrado.');
            return;
        }

        Tenant::create([
            'plan_id' => $proPlan->id,
            'name' => 'Drav Dev (Master)',
            'status' => 'active',
            'company_fantasy_name' => 'Drav Dev Tecnologia',
            'legal_name' => 'Drav Dev Ltda',
            'cnpj' => '00.000.000/0001-00',
            'email' => 'master@dravdev.com',
            'logo_path' => null,
        ]);

        for ($i = 1; $i <= 5; $i++) {
            $companyName = $faker->company;
            Tenant::create([
                'plan_id' => $proPlan->id,
                'name' => "Empresa $i - $companyName",
                'status' => 'active',
                'company_fantasy_name' => $companyName,
                'legal_name' => $companyName . ' Ltda',
                'cnpj' => $faker->cnpj,
                'email' => "contato@empresa$i.com",
                'phone' => $faker->cellphoneNumber,
                'street' => $faker->streetName,
                'number' => $faker->buildingNumber,
                'neighborhood' => $faker->citySuffix,
                'city' => $faker->city,
                'state' => $faker->stateAbbr,
                'cep' => $faker->postcode,
            ]);
        }
    }
}