<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    
    public function definition(): array
    {
        $category = Category::inRandomOrder()->first() ?? Category::factory()->create();

        return [
            'name' => fake()->words(3, true),
            'sku' => fake()->unique()->ean8(),
            'type' => 'produto',
            'category_id' => $category->id,
            'description' => fake()->sentence(),
            'cost_price' => fake()->randomFloat(2, 10, 100),
            'sale_price' => fake()->randomFloat(2, 100, 500),
            'quantity_in_stock' => fake()->numberBetween(0, 100),
        ];
    }
}