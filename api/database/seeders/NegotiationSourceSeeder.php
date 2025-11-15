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

        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Indicação']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Site']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Anúncio Online']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Cliente Antigo']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'WhatsApp']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Instagram']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Facebook']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Google']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Outdoor']);
            NegotiationSource::create(['tenant_id' => $tenant->id, 'name' => 'Feiras e Eventos']);
        }
    }
}
