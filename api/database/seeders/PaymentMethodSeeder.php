<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        PaymentMethod::create(['name' => 'PIX']);
        PaymentMethod::create(['name' => 'Cartão de Crédito']);
        PaymentMethod::create(['name' => 'Boleto Bancário']);
        PaymentMethod::create(['name' => 'Dinheiro']);
    }
}
