<?php

namespace Database\Seeders;

use App\Models\Quote;
use App\Models\Tenant;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuoteSeeder extends Seeder
{
    public function run(): void
    {
        Quote::query()->delete();
        
        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            $customers = Customer::where('tenant_id', $tenant->id)->get();
            $users = User::where('tenant_id', $tenant->id)->get();

            if ($customers->isEmpty() || $users->isEmpty()) {
                continue; 
            }

            for ($i = 0; $i < 15; $i++) {
                Quote::factory()->create([
                    'tenant_id' => $tenant->id,
                    'customer_id' => $customers->random()->id,
                    'user_id' => $users->random()->id,
                ]);
            }
        }
    }
}