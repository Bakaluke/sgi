<?php

namespace Database\Seeders;

use App\Models\QuoteStatus;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuoteStatusSeeder extends Seeder
{
    public function run(): void
    {
        QuoteStatus::query()->delete();
        
        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            QuoteStatus::create(['tenant_id' => $tenant->id, 'name' => 'Aberto', 'color' => 'blue']);
            QuoteStatus::create(['tenant_id' => $tenant->id, 'name' => 'Negociação', 'color' => 'orange']);
            QuoteStatus::create(['tenant_id' => $tenant->id, 'name' => 'Aprovado', 'color' => 'green']);
            QuoteStatus::create(['tenant_id' => $tenant->id, 'name' => 'Cancelado', 'color' => 'red']);
        }
    }
}
