<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * @var list<string>
     */
    
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone'
    ];

    /**
     * @var list<string>
     */
    
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @var array
     */

    protected $appends = ['role'];

    /**
     * @return array<string, string>
     */

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected function role(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->getRoleNames()->first(),
        );
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }
}
