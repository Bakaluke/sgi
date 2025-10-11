<?php
namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use App\Models\Quote;
use App\Models\QuoteItem;
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
        $customer = Customer::inRandomOrder()->first() ?? Customer::factory()->create();
        $user = User::whereIn('id', [2, 3])->inRandomOrder()->first();
        $status = QuoteStatus::whereIn('id', [1, 2])->inRandomOrder()->first();
        $paymentMethod = PaymentMethod::inRandomOrder()->first();
        $paymentTerm = PaymentTerm::inRandomOrder()->first();
        $deliveryMethod = DeliveryMethod::inRandomOrder()->first();
        $negotiationSource = NegotiationSource::inRandomOrder()->first();

        $primaryAddress = $customer->addresses->first();
        $addressString = $primaryAddress ? implode(', ', array_filter([
            $primaryAddress->street,
            $primaryAddress->number ? 'nº ' . $primaryAddress->number : null,
            $primaryAddress->neighborhood,
            $primaryAddress->city ? $primaryAddress->city . ' - ' . $primaryAddress->state : null,
            $primaryAddress->cep
        ])) : 'Endereço não informado';

        $customerSnapshot = [
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $addressString,
        ];

        return [
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'status_id' => $status->id,
            'customer_data' => $customerSnapshot,
            'salesperson_name' => $user->name,
            'payment_method_id' => $paymentMethod->id,
            'payment_term_id' => $paymentTerm->id,
            'delivery_method_id' => $deliveryMethod->id,
            'negotiation_source_id' => $negotiationSource->id,
            'total_amount' => $this->faker->randomFloat(2, 100, 5000),
            'notes' => $this->faker->sentence,
        ];
    }

     public function configure()
    {
        return $this->afterCreating(function (Quote $quote) {
            QuoteItem::factory(rand(1, 5))->create(['quote_id' => $quote->id]);
            $quote->recalculateTotals();
        });
    }
}