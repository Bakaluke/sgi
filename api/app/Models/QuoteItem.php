<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'quote_id',
        'product_id',
        'product_name',
        'quantity',
        'unit_cost_price',
        'unit_sale_price',
        'discount_percentage',
        'total_price',
        'profit_margin',
        'notes',
        'file_path',
        'commission_percentage',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function updateTotalPrice()
    {
        $discount = $this->unit_sale_price * ($this->discount_percentage / 100);
        $priceWithDiscount = $this->unit_sale_price - $discount;
        $this->total_price = $this->quantity * $priceWithDiscount;
        $this->save();
    }
}