<?php

namespace Database\Seeders;

use App\Models\QuoteStatus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuoteStatusSeeder extends Seeder
{
    public function run(): void
    {
        QuoteStatus::create(['name' => 'Aberto', 'color' => 'yellow']);
        QuoteStatus::create(['name' => 'Negociação', 'color' => 'blue']);
        QuoteStatus::create(['name' => 'Aprovado', 'color' => 'green']);
        QuoteStatus::create(['name' => 'Cancelado', 'color' => 'red']);
    }
}
