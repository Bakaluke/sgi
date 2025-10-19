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

        $masterTenant = Tenant::where('name', 'Drav Dev')->first();

        QuoteStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Aberto', 'color' => 'orange']);
        QuoteStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Negociação', 'color' => 'blue']);
        QuoteStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Aprovado', 'color' => 'green']);
        QuoteStatus::create(['tenant_id' => $masterTenant->id, 'name' => 'Cancelado', 'color' => 'red']);
    }
}
