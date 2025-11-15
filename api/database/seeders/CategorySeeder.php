<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::query()->delete();
        
        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            Category::create(['tenant_id' => $tenant->id,'name' => 'Impressão Digital',]);
            Category::create(['tenant_id' => $tenant->id,'name' => 'Brindes Corporativos',]);
            Category::create(['tenant_id' => $tenant->id,'name' => 'Serviços de Design',]);
        }
    }
}
