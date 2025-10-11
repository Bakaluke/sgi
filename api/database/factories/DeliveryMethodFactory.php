<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryMethodFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement(['Retirada na Loja', 'Entrega Expressa', 'Correios']),
        ];
    }
}