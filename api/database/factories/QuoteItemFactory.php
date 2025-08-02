<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteItemFactory extends Factory
{
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first();
        $quantity = fake()->numberBetween(1, 5);
        $salePrice = $product->sale_price;

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantity,
            'unit_cost_price' => $product->cost_price,
            'unit_sale_price' => $salePrice,
            'total_price' => $quantity * $salePrice,
        ];
    }
}