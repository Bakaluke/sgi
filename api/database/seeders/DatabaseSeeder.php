<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            ProductSeeder::class,
            CustomerSeeder::class,
            PaymentMethodSeeder::class,
            DeliveryMethodSeeder::class,
            NegotiationSourceSeeder::class,
            ProductionStatusSeeder::class,
            QuoteStatusSeeder::class,
            QuoteSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
