<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceivableInstallment extends Model
{
    use HasFactory;
    protected $fillable = [
        'account_receivable_id',
        'installment_number',
        'amount',
        'due_date',
        'paid_at',
        'status'
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at' => 'date'
    ];

    public function accountReceivable(): BelongsTo
    {
        return $this->belongsTo(AccountReceivable::class);
    }
}