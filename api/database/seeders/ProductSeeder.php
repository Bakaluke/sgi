<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\StockMovement;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::factory()->count(50)->create();

        foreach ($products as $product) {
            StockMovement::create([
                'product_id' => $product->id,
                'quantity' => $product->quantity_in_stock,
                'type' => 'entrada_inicial',
                'notes' => 'Carga inicial do sistema via Seeder',
            ]);
        }
    }
}