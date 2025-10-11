<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentTermFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'number_of_installments' => 1,
            'days_for_first_installment' => 30,
            'days_between_installments' => 30,
        ];
    }
}