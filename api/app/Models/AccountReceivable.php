<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountReceivable extends Model
{
    use HasFactory;

    protected $table = 'accounts_receivables';

    protected $fillable = [
        'quote_id',
        'customer_id',
        'production_order_id',
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

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function productionOrder(): BelongsTo
    {
        return $this->belongsTo(ProductionOrder::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(ReceivableInstallment::class);
    }
}