<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $proPlan = \App\Models\Plan::first();

        \App\Models\Tenant::create([
            'plan_id' => $proPlan->id,
            'name' => 'Drav Dev (Master)',
            'status' => 'active',
        ]);
    }
}
