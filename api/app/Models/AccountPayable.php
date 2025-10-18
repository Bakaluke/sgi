<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountPayable extends Model
{
    use HasFactory;

    protected $table = 'accounts_payables';

    protected $fillable = [
        'tenant_id',
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

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }
    
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
    
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