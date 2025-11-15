<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        Customer::query()->delete();
        
        $tenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($tenants as $tenant) {
            Customer::factory()->count(10)->create(['tenant_id' => $tenant->id,]);
        }
    }
}