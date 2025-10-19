<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ReceivableInstallmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'installment_number' => 1,
            'amount' => $this->faker->randomFloat(2, 100, 500),
            'due_date' => $this->faker->dateTimeBetween('now', '+1 month'),
            'status' => 'pending',
        ];
    }
}