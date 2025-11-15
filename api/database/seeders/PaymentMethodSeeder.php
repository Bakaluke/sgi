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

        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            PaymentMethod::create(['tenant_id' => $tenant->id, 'name' => 'PIX']);
            PaymentMethod::create(['tenant_id' => $tenant->id, 'name' => 'Cartão de Crédito']);
            PaymentMethod::create(['tenant_id' => $tenant->id, 'name' => 'Boleto Bancário']);
            PaymentMethod::create(['tenant_id' => $tenant->id, 'name' => 'Dinheiro']);
        }
    }
}
