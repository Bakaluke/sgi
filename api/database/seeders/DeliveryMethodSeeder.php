<?php

namespace Database\Seeders;

use App\Models\DeliveryMethod;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeliveryMethodSeeder extends Seeder
{
    public function run(): void
    {
        DeliveryMethod::query()->delete();

        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            DeliveryMethod::create(['tenant_id' => $tenant->id, 'name' => 'Retirada na Loja']);
            DeliveryMethod::create(['tenant_id' => $tenant->id, 'name' => 'Correios']);
            DeliveryMethod::create(['tenant_id' => $tenant->id, 'name' => 'Transportadora']);
            DeliveryMethod::create(['tenant_id' => $tenant->id, 'name' => 'Entregador']);
        }
    }
}
