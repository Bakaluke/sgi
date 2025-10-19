<?php
namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class AccountPayableFactory extends Factory
{
    public function definition(): array
    {
        $tenant = Tenant::first();

        return [
            'tenant_id' => $tenant->id,
            'description' => $this->faker->sentence(3),
            'supplier' => $this->faker->company,
            'total_amount' => $this->faker->randomFloat(2, 50, 1000),
            'due_date' => $this->faker->dateTimeBetween('now', '+2 months'),
            'status' => 'pending',
        ];
    }
}