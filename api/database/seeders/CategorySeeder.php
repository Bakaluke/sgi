<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::query()->delete();
        
        $masterTenant = Tenant::where('name', 'Drav Dev (Master)')->first();

        if (!$masterTenant) {
            $this.command->error('Tenant Master "Drav Dev (Master)" não encontrado. Rode o TenantSeeder primeiro.');
            return;
        }

        Category::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Impressão Digital',
        ]);
        
        Category::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Brindes Corporativos',
        ]);

        Category::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Serviços de Design',
        ]);
    }
}