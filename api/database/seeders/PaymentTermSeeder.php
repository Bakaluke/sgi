<?php

namespace Database\Seeders;

use App\Models\PaymentTerm;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentTermSeeder extends Seeder
{
    public function run(): void
    {
        PaymentTerm::create(['name' => 'À Vista', 'number_of_installments' => 1, 'days_for_first_installment' => 0]);
        PaymentTerm::create(['name' => '30 Dias', 'number_of_installments' => 1, 'days_for_first_installment' => 30]);
        PaymentTerm::create(['name' => '30/60 Dias', 'number_of_installments' => 2, 'days_for_first_installment' => 30]);
        PaymentTerm::create(['name' => 'Entrada + 1x', 'number_of_installments' => 2, 'days_for_first_installment' => 0]);
        PaymentTerm::create(['name' => 'Entrada + 2x', 'number_of_installments' => 3, 'days_for_first_installment' => 0]);
        PaymentTerm::create(['name' => 'Parcelado em 3x', 'number_of_installments' => 3, 'days_for_first_installment' => 30]);
        PaymentTerm::create(['name' => 'Parcelado em 6x', 'number_of_installments' => 6, 'days_for_first_installment' => 30]);
        PaymentTerm::create(['name' => 'Parcelado em 10x', 'number_of_installments' => 10, 'days_for_first_installment' => 30]);
    }
}
