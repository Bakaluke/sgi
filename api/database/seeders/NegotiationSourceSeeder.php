<?php

namespace Database\Seeders;

use App\Models\NegotiationSource;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NegotiationSourceSeeder extends Seeder
{
    public function run(): void
    {
        NegotiationSource::query()->delete();

        $masterTenant = Tenant::where('name', 'Drav Dev')->first();

        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Indicação']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Site']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Anúncio Online']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Cliente Antigo']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'WhatsApp']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Instagram']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Facebook']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Google']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Outdoor']);
        NegotiationSource::create(['tenant_id' => $masterTenant->id, 'name' => 'Feiras e Eventos']);
    }
}
