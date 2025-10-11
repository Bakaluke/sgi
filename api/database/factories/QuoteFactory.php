<?php
namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use App\Models\QuoteStatus;
use App\Models\PaymentMethod;
use App\Models\PaymentTerm;
use App\Models\DeliveryMethod;
use App\Models\NegotiationSource;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteFactory extends Factory
{
    public function definition(): array
    {
        $customer = Customer::factory()->create();
        $user = User::factory()->create();
        $status = QuoteStatus::inRandomOrder()->first();
        $paymentMethod = PaymentMethod::inRandomOrder()->first();
        $paymentTerm = PaymentTerm::inRandomOrder()->first();
        $deliveryMethod = DeliveryMethod::inRandomOrder()->first();
        $negotiationSource = NegotiationSource::inRandomOrder()->first();

        return [
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'status_id' => $status->id,
            'payment_method_id' => $paymentMethod->id,
            'payment_term_id' => $paymentTerm->id,
            'delivery_method_id' => $deliveryMethod->id,
            'negotiation_source_id' => $negotiationSource->id,
            'total_amount' => $this->faker->randomFloat(2, 100, 5000),
            'customer_data' => [],
            'salesperson_name' => $user->name,
        ];
    }
}