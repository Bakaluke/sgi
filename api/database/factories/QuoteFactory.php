<?php

namespace Database\Factories;

use App\Models\Tenant;
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
        $status = QuoteStatus::withoutGlobalScopes()->whereIn('id', [1, 2])->inRandomOrder()->first();
        $paymentMethod = PaymentMethod::withoutGlobalScopes()->inRandomOrder()->first();
        $paymentTerm = PaymentTerm::withoutGlobalScopes()->inRandomOrder()->first();
        $deliveryMethod = DeliveryMethod::withoutGlobalScopes()->inRandomOrder()->first();
        $negotiationSource = NegotiationSource::withoutGlobalScopes()->inRandomOrder()->first();
        
        $customer = Customer::factory();
        $user = User::factory();
        
        return [
            'customer_id' => $customer,
            'user_id' => $user,
            'status_id' => $status->id,
            'payment_method_id' => $paymentMethod->id,
            'payment_term_id' => $paymentTerm->id,
            'delivery_method_id' => $deliveryMethod->id,
            'negotiation_source_id' => $negotiationSource->id,
            'total_amount' => $this->faker->randomFloat(2, 100, 5000),
            'notes' => $this->faker->sentence,
            'customer_data' => [], 
            'salesperson_name' => '',
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (Quote $quote) {
            $quote->load([
                'customer' => fn ($query) => $query->withoutGlobalScopes()->with('addresses'),
                'user' => fn ($query) => $query->withoutGlobalScopes()
            ]); 

            $customer = $quote->customer;
            $user = $quote->user;

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

            QuoteItem::factory(rand(1, 5))->create([
                'quote_id' => $quote->id,
                'tenant_id' => $quote->tenant_id,
            ]);
            
            $quote->customer_data = $customerSnapshot;
            $quote->salesperson_name = $user->name;
            $quote->recalculateTotals();
        });
    }
}