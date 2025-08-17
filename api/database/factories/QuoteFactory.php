<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;
use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuoteFactory extends Factory
{
    public function definition(): array
    {
        $customer = Customer::has('addresses')->with('addresses')->inRandomOrder()->first();
        $user = User::whereHas('roles', fn ($query) => $query->where('name', 'vendedor'))->inRandomOrder()->first();
        $paymentMethod = PaymentMethod::inRandomOrder()->first();

        $primaryAddress = $customer->addresses->first();
        $addressString = $primaryAddress ? implode(', ', array_filter([
            $primaryAddress->street,
            $primaryAddress->number ? 'nº '.$primaryAddress->number : null,
            $primaryAddress->complement,
            $primaryAddress->neighborhood,
            $primaryAddress->city . ' - ' . $primaryAddress->state,
            $primaryAddress->cep ? $primaryAddress->cep : null
        ])) : null;

        $customerSnapshot = [
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $addressString,
        ];

        return [
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'status' => fake()->randomElement(['Aberto', 'Negociação']),
            'customer_data' => $customerSnapshot,
            'salesperson_name' => $user->name,
            'delivery_method' => fake()->randomElement(['Retirada na Loja', 'Correios', 'Transportadora', 'Delivery']),
            'payment_method_id' => $paymentMethod->id,
            'notes' => fake()->sentence(),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Quote $quote) {
            $items = QuoteItem::factory()->count(fake()->numberBetween(2, 5))->create([
                'quote_id' => $quote->id,
            ]);

            $subtotal = $items->sum('total_price');
            $quote->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);
        });
    }
}