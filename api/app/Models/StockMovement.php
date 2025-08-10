<?php

namespace App\Models;

use App\Events\StockMovementCreated;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'type',
        'notes',
        'cost_price',
    ];

    /**
     * @var array
     */
    protected $dispatchesEvents = [
        'created' => StockMovementCreated::class,
    ];
    
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}