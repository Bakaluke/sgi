<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->delete();

        $masterTenant = Tenant::where('name', 'Drav Dev (Master)')->first();
        
        User::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Super Admin Drav',
            'email' => 'admin@dravdev.com',
            'password' => 'password',
        ])->assignRole('admin');

        $clientTenants = Tenant::where('name', '!=', 'Drav Dev (Master)')->get();

        foreach ($clientTenants as $index => $tenant) {
            $i = $index + 1;
            
            User::factory()->create([
                'tenant_id' => $tenant->id,
                'name' => "Dono da Empresa $i",
                'email' => "admin@empresa$i.com",
                'password' => 'password',
            ])->assignRole('admin');

            User::factory()->create([
                'tenant_id' => $tenant->id,
                'name' => "Vendedor da Empresa $i",
                'email' => "vendedor@empresa$i.com",
                'password' => 'password',
            ])->assignRole('vendedor');

            User::factory()->create([
                'tenant_id' => $tenant->id,
                'name' => "Operador da Empresa $i",
                'email' => "producao@empresa$i.com",
                'password' => 'password',
            ])->assignRole('producao');
        }
    }
}