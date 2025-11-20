<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => function (array $attributes) {
                $tenantId = $attributes['tenant_id'] ?? 1;
                return Product::withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)
                    ->inRandomOrder()
                    ->first()
                    ->id ?? Product::factory()->create(['tenant_id' => $tenantId])->id;
            },
            'product_name' => function (array $attributes) {
                return Product::withoutGlobalScopes()->find($attributes['product_id'])->name;
            },
            'quantity' => $this->faker->numberBetween(1, 5),
            'unit_cost_price' => function (array $attributes) {
                return Product::withoutGlobalScopes()->find($attributes['product_id'])->cost_price;
            },
            'unit_sale_price' => function (array $attributes) {
                return Product::withoutGlobalScopes()->find($attributes['product_id'])->sale_price;
            },
            'total_price' => function (array $attributes) {
                return $attributes['quantity'] * $attributes['unit_sale_price'];
            },
            'profit_margin' => 30,
            'discount_percentage' => 0,
            'notes' => $this->faker->optional()->sentence,
        ];
    }
}