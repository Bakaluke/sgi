<?php
namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'legal_name' => 'Cake Web Desenvolvimento de Sistemas Ltda',
            'company_fantasy_name' => 'Cake Web Dev',
            'cnpj' => '12345678000199',
            'email' => 'contato@cakewebdev.com.br',
            'phone' => '86999998888',
            'cep' => '64000000',
            'street' => 'Rua dos Programadores',
            'number' => '1024',
            'neighborhood' => 'Centro',
            'city' => 'Teresina',
            'state' => 'PI',
            'website' => 'https://cakewebdev.com.br',
        ]);
    }
}