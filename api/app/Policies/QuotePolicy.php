<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('quotes.view');
    }

    public function view(User $user, Quote $quote): bool
    {
        if ($user->can('quotes.view_all')) {
            return true;
        }
        return $user->can('quotes.view') && $user->id === $quote->user_id;
    }

    public function create(User $user): bool
    {
        return $user->can('quotes.create');
    }

    public function update(User $user, Quote $quote): bool
    {
        if (in_array($quote->status, ['Aprovado', 'Cancelado'])) {
            return false;
        }

        return $user->can('quotes.edit');
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $user->can('quotes.delete');
    }
}