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
            'name' => 'Administrador',
            'email' => 'admin@sgi.test',
            'password' => 'password',
        ])->assignRole('admin');

        User::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Vendedor Alpha',
            'email' => 'vendedor_alpha@sgi.test',
            'password' => 'password',
        ])->assignRole('vendedor');

        User::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Vendedor Beta',
            'email' => 'vendedor_beta@sgi.test',
            'password' => 'password',
        ])->assignRole('vendedor');

        User::factory()->create([
            'tenant_id' => $masterTenant->id,
            'name' => 'Produção Teste',
            'email' => 'producao@sgi.test',
            'password' => 'password',
        ])->assignRole('producao');
    }
}