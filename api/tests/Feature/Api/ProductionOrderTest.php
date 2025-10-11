<?php

namespace Tests\Feature\Api;

use App\Models\ProductionOrder;
use App\Models\ProductionStatus;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionOrderTest extends TestCase
{
    use RefreshDatabase;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_um_usuario_nao_autenticado_nao_pode_listar_ordens_de_producao(): void
    {
        $this->getJson('/api/production-orders')->assertStatus(401);
    }

    public function test_um_admin_pode_listar_todas_as_ordens_de_producao(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser = User::factory()->create()->assignRole($adminRole);
        ProductionOrder::factory(5)->create();
        $response = $this->actingAs($adminUser)->getJson('/api/production-orders');
        $response->assertStatus(200)->assertJsonCount(5, 'data');
    }

    public function test_um_usuario_de_producao_pode_listar_todas_as_ordens_de_producao(): void
    {
        $producaoRole = Role::where('name', 'producao')->first();
        $producaoUser = User::factory()->create()->assignRole($producaoRole);
        ProductionOrder::factory(5)->create();
        $response = $this->actingAs($producaoUser)->getJson('/api/production-orders');
        $response->assertStatus(200)->assertJsonCount(5, 'data');
    }

    public function test_um_vendedor_pode_listar_apenas_suas_proprias_ordens_de_producao(): void
    {
        $vendedorRole = Role::where('name', 'vendedor')->first();
        $vendedorUser = User::factory()->create()->assignRole($vendedorRole);
        ProductionOrder::factory(2)->create(['user_id' => $vendedorUser->id]);
        ProductionOrder::factory(3)->create();
        $response = $this->actingAs($vendedorUser)->getJson('/api/production-orders');
        $response->assertStatus(200)->assertJsonCount(2, 'data');
    }

    public function test_um_usuario_de_producao_pode_atualizar_o_status_de_um_pedido(): void
    {
        $producaoRole = Role::where('name', 'producao')->first();
        $producaoUser = User::factory()->create()->assignRole($producaoRole);
        $order = ProductionOrder::factory()->create();
        $newStatus = ProductionStatus::where('name', 'Concluído')->first();

        $response = $this->actingAs($producaoUser)->putJson("/api/production-orders/{$order->id}", [
            'status_id' => $newStatus->id,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('production_orders', [
            'id' => $order->id,
            'status_id' => $newStatus->id,
        ]);
    }
}