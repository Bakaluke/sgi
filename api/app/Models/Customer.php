<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'type',
        'document',
        'name',
        'legal_name',
        'email',
        'phone',
    ];

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }
}