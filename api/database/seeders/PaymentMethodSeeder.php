<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        PaymentMethod::query()->delete();

        $masterTenant = Tenant::where('name', 'Drav Dev')->first();

        PaymentMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'PIX']);
        PaymentMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Cartão de Crédito']);
        PaymentMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Boleto Bancário']);
        PaymentMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Dinheiro']);
    }
}
