<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    
    protected $fillable = [
        'name',
        'sku',
        'description',
        'cost_price',
        'sale_price',
        'quantity_in_stock',
    ];

    public function quoteItems(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }
}