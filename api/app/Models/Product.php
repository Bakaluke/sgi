<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class Product extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    
    protected $fillable = [
        'tenant_id',
        'internal_id',
        'name',
        'sku',
        'type',
        'category_id',
        'description',
        'cost_price',
        'sale_price',
        'quantity_in_stock',
        'image_path',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
        
        static::creating(function (Product $product) {
            if (is_null($product->internal_id)) {
                $tenantId = $product->tenant_id ?? Auth::user()->tenant_id;
                if ($tenantId) {
                    $maxId = Product::where('tenant_id', $tenantId)->max('internal_id');
                    $product->internal_id = ($maxId ?? 0) + 1;
                }
            }
        });
    }

    public function quoteItems(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
    
    public function isProduct(): bool
    {
        return $this->type === 'produto';
    }

    public function isService(): bool
    {
        return $this->type === 'servico';
    }
}
