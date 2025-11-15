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
        $teresinaTenant = Tenant::where('name', 'Teresina Brindes')->first();
        $padariaTenant = Tenant::where('name', 'Padaria Pão Quente')->first();

        User::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Admin Drav Dev',
            'email' => 'admin@dravdev.com',
            'password' => 'password',
        ])->assignRole('admin');

        User::factory()->create([
            'tenant_id' => $teresinaTenant->id,
            'name' => 'Gerente Teresina',
            'email' => 'admin@teresina.com',
            'password' => 'password',
        ])->assignRole('admin');
        
        User::factory()->create([
            'tenant_id' => $teresinaTenant->id,
            'name' => 'Vendedor Teresina',
            'email' => 'vendedor@teresina.com',
            'password' => 'password',
        ])->assignRole('vendedor');

        User::factory()->create([
            'tenant_id' => $padariaTenant->id,
            'name' => 'Seu Zé (Dono)',
            'email' => 'admin@padaria.com',
            'password' => 'password',
        ])->assignRole('admin');
    }
}
