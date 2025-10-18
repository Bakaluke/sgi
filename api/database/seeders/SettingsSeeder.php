<?php
namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'legal_name' => 'Drav Desenvolvimento de Sistemas Ltda',
            'company_fantasy_name' => 'Drav Dev',
            'cnpj' => '12345678000199',
            'email' => 'contato@dravdev.com.br',
            'phone' => '86999998888',
            'cep' => '64000000',
            'street' => 'Rua dos Programadores',
            'number' => '1024',
            'neighborhood' => 'Centro',
            'city' => 'Teresina',
            'state' => 'PI',
            'website' => 'https://dravdev.com.br',
        ]);
    }
}