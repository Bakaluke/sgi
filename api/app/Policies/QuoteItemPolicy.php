<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;

class QuoteItemPolicy
{
    public function create(User $user, Quote $quote): bool
    {
        return $user->can('quotes.edit') && $user->id === $quote->user_id;
    }

    public function update(User $user, QuoteItem $quoteItem): bool
    {
        return $user->can('quotes.edit') && $user->id === $quoteItem->quote->user_id;
    }

    public function delete(User $user, QuoteItem $quoteItem): bool
    {
        return $user->can('quotes.edit') && $user->id === $quoteItem->quote->user_id;
    }
}