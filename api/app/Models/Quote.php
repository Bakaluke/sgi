<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'customer_id',
        'user_id',
        'status_id',
        'customer_data',
        'salesperson_name',
        'delivery_datetime',
        'payment_method_id',
        'payment_term_id',
        'delivery_method_id',
        'negotiation_source_id',
        'subtotal',
        'discount_percentage',
        'total_amount',
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

    protected function customerData(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => json_decode($value, true),
            set: fn ($value) => json_encode($value),
        );
    }

    public function getTranslatedStatus(): string
    {
        return $this->status?->name ?? 'N/A';
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(QuoteStatus::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function paymentTerm(): BelongsTo
    {
        return $this->belongsTo(PaymentTerm::class);
    }

    public function deliveryMethod(): BelongsTo
    {
        return $this->belongsTo(DeliveryMethod::class);
    }

    public function negotiationSource(): BelongsTo
    {
        return $this->belongsTo(NegotiationSource::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function recalculateTotals()
    {
        $subtotal = $this->items()->sum('total_price');

        $discountValue = $subtotal * ($this->discount_percentage / 100);

        $totalAmount = $subtotal - $discountValue;

        $this->subtotal = $subtotal;
        $this->total_amount = $totalAmount;
        $this->save();
    }
}