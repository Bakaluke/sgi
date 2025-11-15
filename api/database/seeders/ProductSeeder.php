<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Tenant;
use App\Models\StockMovement;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::query()->delete();
        StockMovement::query()->delete();

        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            $products = Product::factory()->count(20)->create([
                'tenant_id' => $tenant->id,
            ]);
            
            foreach ($products as $product) {
                StockMovement::create([
                    'tenant_id' => $tenant->id,
                    'product_id' => $product->id,
                    'quantity' => $product->quantity_in_stock,
                    'type' => 'Entrada Inicial',
                    'notes' => 'Carga inicial do sistema via Seeder',
                ]);
            }
        }
    }
}
