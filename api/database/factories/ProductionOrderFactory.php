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
        $quote = Quote::factory()->create();

        $status = ProductionStatus::inRandomOrder()->first() ?? ProductionStatus::factory()->create();

        return [
            'tenant_id' => $quote->tenant_id,
            'quote_id' => $quote->id,
            'user_id' => $quote->user_id,
            'customer_id' => $quote->customer_id,
            'status_id' => $status->id,
        ];
    }
}