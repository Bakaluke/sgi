<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\Quote;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuoteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $this->seed(\Database\Seeders\QuoteStatusSeeder::class);
        $this->seed(\Database\Seeders\PaymentMethodSeeder::class);
        $this->seed(\Database\Seeders\PaymentTermSeeder::class);
        $this->seed(\Database\Seeders\DeliveryMethodSeeder::class);
        $this->seed(\Database\Seeders\NegotiationSourceSeeder::class);
    }

    public function test_um_usuario_nao_autenticado_nao_pode_listar_orcamentos(): void
    {
        $this->getJson('/api/quotes')->assertStatus(401);
    }

    public function test_um_admin_pode_listar_todos_os_orcamentos(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $adminUser = User::factory()->create()->assignRole($adminRole);

        Customer::factory(5)->create()->each(function ($customer) {
            Quote::factory()->create(['customer_id' => $customer->id]);
        });
        
        $response = $this->actingAs($adminUser)->getJson('/api/quotes');
        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    public function test_um_vendedor_pode_listar_apenas_seus_proprios_orcamentos(): void
    {
        $vendedorRole = Role::where('name', 'vendedor')->first();
        $vendedorUser = User::factory()->create()->assignRole($vendedorRole);
        $otherUser = User::factory()->create();

        Customer::factory(2)->create()->each(function ($customer) use ($vendedorUser) {
            Quote::factory()->create(['customer_id' => $customer->id, 'user_id' => $vendedorUser->id]);
        });
        Customer::factory(3)->create()->each(function ($customer) use ($otherUser) {
            Quote::factory()->create(['customer_id' => $customer->id, 'user_id' => $otherUser->id]);
        });

        $response = $this->actingAs($vendedorUser)->getJson('/api/quotes');
        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }
}