<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class NegotiationSourceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement(['Instagram', 'Indicação', 'Site', 'Loja Física']),
        ];
    }
}