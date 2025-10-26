<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class AccountPayable extends Model
{
    use HasFactory;

    protected $table = 'accounts_payables';

    protected $fillable = [
        'tenant_id',
        'internal_id',
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

        static::creating(function (AccountPayable $account) {
            if (is_null($account->internal_id)) {
                $tenantId = $account->tenant_id ?? Auth::user()->tenant_id;                
                if ($tenantId) {
                    $maxId = AccountPayable::where('tenant_id', $tenantId)->max('internal_id');
                    $account->internal_id = ($maxId ?? 0) + 1;
                }
            }
        });
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