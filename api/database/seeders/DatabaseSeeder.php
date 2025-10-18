<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PlanSeeder::class,
            TenantSeeder::class,
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            ProductSeeder::class,
            CustomerSeeder::class,
            PaymentMethodSeeder::class,
            PaymentTermSeeder::class,
            DeliveryMethodSeeder::class,
            NegotiationSourceSeeder::class,
            ProductionStatusSeeder::class,
            QuoteStatusSeeder::class,
            QuoteSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
