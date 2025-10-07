<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_um_usuario_nao_autenticado_nao_pode_listar_clientes(): void
    {
        $response = $this->getJson('/api/customers');
        $response->assertStatus(401);
    }

    public function test_um_admin_autenticado_pode_listar_clientes(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser = User::factory()->create()->assignRole($adminRole);

        $response = $this->actingAs($adminUser)->getJson('/api/customers');
        $response->assertStatus(200);
    }

    public function test_um_vendedor_autenticado_pode_listar_clientes(): void
    {
        $vendedorRole = Role::where('name', 'vendedor')->first();
        $vendedorUser = User::factory()->create()->assignRole($vendedorRole);

        $response = $this->actingAs($vendedorUser)->getJson('/api/customers');
        $response->assertStatus(200);
    }

    public function test_um_usuario_de_producao_autenticado_pode_listar_clientes(): void
    {
        $producaoRole = Role::where('name', 'producao')->first();
        $producaoUser = User::factory()->create()->assignRole($producaoRole);

        $response = $this->actingAs($producaoUser)->getJson('/api/customers');
        
        $response->assertStatus(200);
    }

    public function test_um_usuario_de_producao_pode_criar_um_cliente(): void
    {
        $producaoRole = Role::where('name', 'producao')->first();
        $producaoUser = User::factory()->create()->assignRole($producaoRole);

        $customerData = Customer::factory()->make()->toArray();
        $customerData['address'] = ['cep' => '12345-678', 'street' => 'Rua Teste', 'number' => '1', 'neighborhood' => 'Bairro', 'city' => 'Cidade', 'state' => 'UF'];
        
        $response = $this->actingAs($producaoUser)->postJson('/api/customers', $customerData);

        $response->assertStatus(201);
    }

    public function test_retorna_erro_de_validacao_ao_criar_cliente_sem_nome(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser = User::factory()->create()->assignRole($adminRole);
        $customerData = Customer::factory()->make()->toArray();
        unset($customerData['name']);
        $response = $this->actingAs($adminUser)->postJson('/api/customers', $customerData);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('name');
    }

    public function test_um_admin_pode_criar_um_cliente_com_sucesso(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser = User::factory()->create()->assignRole($adminRole);
        
        $customerData = Customer::factory()->make()->toArray();
        $customerData['address'] = [
            'cep' => '64000-000', 'street' => 'Rua Teste', 'number' => '123',
            'neighborhood' => 'Centro', 'city' => 'Teresina', 'state' => 'PI',
        ];

        $response = $this->actingAs($adminUser)->postJson('/api/customers', $customerData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('customers', ['name' => $customerData['name'], 'email' => $customerData['email']]);
        
        $this->assertDatabaseHas('addresses', ['cep' => '64000-000']);
    }
}