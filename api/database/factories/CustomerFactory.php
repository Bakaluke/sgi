<?php
namespace Database\Factories;

use App\Models\Customer;
use App\Models\Address;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['fisica', 'juridica']);
        return [
            'type' => $type,
            'document' => $type === 'fisica' ? fake()->unique()->numerify('###########') : fake()->unique()->numerify('##############'),
            'name' => $type === 'fisica' ? fake()->name() : fake()->company(),
            'legal_name' => $type === 'juridica' ? fake()->company() . ' LTDA' : null,
            'email' => fake()->unique()->safeEmail(),
            'phone' => str_replace(['(', ')', '-', ' '], '', fake()->phoneNumber()),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Customer $customer) {
            Address::factory()->create([
                'customer_id' => $customer->id,
            ]);
        });
    }
}