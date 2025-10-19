<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionOrder extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'tenant_id',
        'quote_id',
        'user_id',
        'customer_id',
        'status_id',
        'completed_at',
        'notes',
        'cancellation_reason',
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
        return $this->status?->name ?? 'N/A';
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ProductionStatus::class);
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}