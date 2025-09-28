<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountPayable extends Model
{
    use HasFactory;

    protected $table = 'accounts_payables';

    protected $fillable = [
        'description',
        'supplier',
        'total_amount', 
        'paid_amount',
        'due_date',
        'paid_at',
        'status'
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at' => 'date',
    ];
    
    public function getTranslatedStatus(): string
    {
        return match ($this->status) {
            'paid' => 'Pago',
            'partially_paid' => 'Pago Parcial',
            'overdue' => 'Vencido',
            'pending' => 'Pendente',
            default => ucfirst($this->status),
        };
    }
}