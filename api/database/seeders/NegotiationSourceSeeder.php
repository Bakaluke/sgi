<?php

namespace Database\Seeders;

use App\Models\NegotiationSource;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NegotiationSourceSeeder extends Seeder
{
    public function run(): void
    {
        NegotiationSource::create(['name' => 'Indicação']);
        NegotiationSource::create(['name' => 'Site']);
        NegotiationSource::create(['name' => 'Anúncio Online']);
        NegotiationSource::create(['name' => 'Cliente Antigo']);
        NegotiationSource::create(['name' => 'WhatsApp']);
        NegotiationSource::create(['name' => 'Instagram']);
        NegotiationSource::create(['name' => 'Facebook']);
        NegotiationSource::create(['name' => 'Google']);
        NegotiationSource::create(['name' => 'Outdoor']);
        NegotiationSource::create(['name' => 'Feiras e Eventos']);
    }
}
