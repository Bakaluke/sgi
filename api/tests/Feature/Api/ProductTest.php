<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_um_usuario_nao_autenticado_nao_pode_listar_produtos(): void
    {
        $this->getJson('/api/products')->assertStatus(401);
    }

    public function test_todos_os_perfis_autenticados_podem_listar_produtos(): void
    {
        $vendedorRole = Role::where('name', 'vendedor')->first();
        $vendedorUser = User::factory()->create()->assignRole($vendedorRole);
        $this->actingAs($vendedorUser)->getJson('/api/products')->assertStatus(200);

        $producaoRole = Role::where('name', 'producao')->first();
        $producaoUser = User::factory()->create()->assignRole($producaoRole);
        $this->actingAs($producaoUser)->getJson('/api/products')->assertStatus(200);
    }

    public function test_um_vendedor_pode_criar_um_produto(): void
    {
        $vendedorRole = Role::where('name', 'vendedor')->first();
        $vendedorUser = User::factory()->create()->assignRole($vendedorRole);
        
        $productData = Product::factory()->make()->toArray();

        $this->actingAs($vendedorUser)->postJson('/api/products', $productData)->assertStatus(201);
    }
    
    public function test_um_admin_pode_criar_um_produto(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser = User::factory()->create()->assignRole($adminRole);
        
        $productData = Product::factory()->make()->toArray();

        $this->actingAs($adminUser)->postJson('/api/products', $productData)->assertStatus(201);
        $this->assertDatabaseHas('products', ['sku' => $productData['sku']]);
    }
}