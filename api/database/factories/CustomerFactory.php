<?php
namespace Database\Factories;

use App\Models\Tenant;
use App\Models\Customer;
use App\Models\Address;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        $tenant = Tenant::first();

        $type = $this->faker->randomElement(['fisica', 'juridica']);
        
        $isFisica = $type === 'fisica';

        return [
            'tenant_id' => $tenant->id,
            'type' => $type,
            'document' => $isFisica ? $this->faker->unique()->cpf(false) : $this->faker->unique()->cnpj(false),
            'name' => $isFisica ? $this->faker->name() : $this->faker->company(),
            'legal_name' => $isFisica ? null : $this->faker->company() . ' Ltda.',
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('###########'),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Customer $customer) {
            Address::factory()->create([
                'customer_id' => $customer->id,
                'tenant_id' => $customer->tenant_id,
            ]);
        });
    }
}