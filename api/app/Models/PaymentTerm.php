<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTerm extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'number_of_installments',
        'days_for_first_installment',
        'days_between_installments',
        'is_active'
    ];
}
