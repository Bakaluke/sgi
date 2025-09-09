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
        $costPrice = $product->isService() ? 0 : $product->cost_price;
        $salePrice = $product->sale_price;
        $lucro = $salePrice - $costPrice;
        $profit = $lucro / $salePrice;

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => $quantity,
            'unit_cost_price' => $product->cost_price,
            'unit_sale_price' => $salePrice,
            'total_price' => $quantity * $salePrice,
            'profit_margin' => $profit * 100,
        ];
    }
}