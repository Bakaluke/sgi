<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteStatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'color' => $this->faker->colorName(),
        ];
    }
}