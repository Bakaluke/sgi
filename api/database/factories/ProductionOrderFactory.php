<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\ProductionStatus;
use App\Models\Quote;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductionOrderFactory extends Factory
{
    public function definition(): array
    {
        $user = User::factory()->create();
        $customer = Customer::factory()->create();
        $quote = Quote::factory()->create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
        ]);
        $status = ProductionStatus::inRandomOrder()->first() ?? ProductionStatus::factory()->create();

        return [
            'quote_id' => $quote->id,
            'user_id' => $user->id,
            'customer_id' => $customer->id,
            'status_id' => $status->id,
        ];
    }
}