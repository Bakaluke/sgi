<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;

class QuoteItemPolicy
{
    public function create(User $user, Quote $quote): bool
    {
        return $user->can('update', $quote);
    }

    public function update(User $user, QuoteItem $quoteItem): bool
    {
        if (in_array($quoteItem->quote->status, ['Aprovado', 'Cancelado'])) {
            return false;
        }
        
        return $user->can('update', $quoteItem->quote);
    }

    public function delete(User $user, QuoteItem $quoteItem): bool
    {
        if (in_array($quoteItem->quote->status, ['Aprovado', 'Cancelado'])) {
            return false;
        }

        return $user->can('update', $quoteItem->quote);
    }
}