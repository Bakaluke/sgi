<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, Quote $quote): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return $user->id === $quote->user_id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'vendedor']);
    }

    public function update(User $user, Quote $quote): bool
    {
        if (in_array($quote->status, ['Aprovado', 'Cancelado'])) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }
        return $user->id === $quote->user_id;
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $user->role === 'admin';
    }
}