<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteItemFactory extends Factory
{
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        
        $quantity = $this->faker->numberBetween(1, 5);

        $salePrice = $product->sale_price;

        $costPrice = $product->isService() ? 0 : $product->cost_price;

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantity,
            'unit_cost_price' => $costPrice,
            'unit_sale_price' => $salePrice,
            'total_price' => $quantity * $salePrice,
            'profit_margin' => $salePrice > 0 ? (($salePrice - $costPrice) / $salePrice) * 100 : 0,
        ];
    }
}