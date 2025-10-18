<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\StockMovement;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::query()->delete();
        
        $masterTenant = Tenant::where('name', 'Drav Dev')->first();

        if (!$masterTenant) {
            $this.command->error('Tenant Master "Drav Dev" não encontrado. Rode o TenantSeeder primeiro.');
            return;
        }

        $products = Product::factory()->count(50)->create(['tenant_id' => $masterTenant->id,]);

        foreach ($products as $product) {
            StockMovement::create([
                'tenant_id' => $masterTenant->id,
                'product_id' => $product->id,
                'quantity' => $product->quantity_in_stock,
                'cost_price' => $product->cost_price,
                'type' => 'Entrada Inicial',
                'notes' => 'Carga inicial do sistema via Seeder',
            ]);
        }
    }
}