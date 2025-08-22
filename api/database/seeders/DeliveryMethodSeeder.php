<?php

namespace Database\Seeders;

use App\Models\DeliveryMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeliveryMethodSeeder extends Seeder
{
    public function run(): void
    {
        DeliveryMethod::create(['name' => 'Retirada na Loja']);
        DeliveryMethod::create(['name' => 'Correios']);
        DeliveryMethod::create(['name' => 'Transportadora']);
        DeliveryMethod::create(['name' => 'Entregador']);
    }
}
