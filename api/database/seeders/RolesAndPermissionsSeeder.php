<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'users.manage', 'settings.manage',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
            'quotes.view', 'quotes.view_all', 'quotes.create', 'quotes.edit', 'quotes.delete', 'quotes.approve',
            'production_orders.view', 'production_orders.view_all', 'production_orders.update_status', 'production_orders.delete',
            'stock.manage', 'categories.manage','finance.view_receivables',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'api']);
        }
        
        $vendedorRole = Role::create(['name' => 'vendedor', 'display_name' => 'Vendedor', 'guard_name' => 'api']);
        $vendedorPermissions = [
            'products.view', 'products.create', 'products.edit',
            'customers.view', 'customers.create', 'customers.edit',
            'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.approve',
            'production_orders.view', 'production_orders.update_status',
            'stock.manage', 'categories.manage',
        ];
        $vendedorRole->givePermissionTo($vendedorPermissions);

        $producaoRole = Role::create(['name' => 'producao', 'display_name' => 'Produção', 'guard_name' => 'api']);
        $producaoPermissions = [
            'products.view', 'products.create', 'products.edit',
            'customers.view', 'customers.create', 'customers.edit',
            'production_orders.view_all', 'production_orders.update_status',
            'stock.manage', 'categories.manage',
        ];
        $producaoRole->givePermissionTo($producaoPermissions);
        
        $adminRole = Role::create(['name' => 'admin', 'display_name' => 'Administrador', 'guard_name' => 'api']);
        $adminRole->givePermissionTo(Permission::all());
    }
}