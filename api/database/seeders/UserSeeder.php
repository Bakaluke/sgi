<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->delete();

        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@sgi.test',
            'password' => 'password',
        ])->assignRole('admin');

        User::factory()->create([
            'name' => 'Vendedor Alpha',
            'email' => 'vendedor_alpha@sgi.test',
            'password' => 'password',
        ])->assignRole('vendedor');

        User::factory()->create([
            'name' => 'Vendedor Beta',
            'email' => 'vendedor_beta@sgi.test',
            'password' => 'password',
        ])->assignRole('vendedor');

        User::factory()->create([
            'name' => 'Produção Teste',
            'email' => 'producao@sgi.test',
            'password' => 'password',
        ])->assignRole('producao');
    }
}
