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

        $masterTenant = Tenant::where('name', 'Drav Dev')->first();

        DeliveryMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Retirada na Loja']);
        DeliveryMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Correios']);
        DeliveryMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Transportadora']);
        DeliveryMethod::create(['tenant_id' => $masterTenant->id, 'name' => 'Entregador']);
    }
}
