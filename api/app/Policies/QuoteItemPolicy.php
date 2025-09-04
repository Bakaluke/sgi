<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\User;

class QuoteItemPolicy
{
    public function create(User $user, Quote $quote): bool
    {
        if ($user->can('quotes.view_all')) { return true; }
        return $user->can('quotes.create') && $user->id === $quote->user_id;
    }

    public function update(User $user, QuoteItem $quoteItem, Quote $quote): bool
    {
        if ($user->can('quotes.view_all')) { return true; }

        return $user->can('quotes.edit') && $user->id === $quote->user_id;
    }

    public function delete(User $user, QuoteItem $quoteItem, Quote $quote): bool
    {
        if ($user->can('quotes.view_all')) { return true; }
        return $user->can('quotes.delete') && $user->id === $quote->user_id;
    }
}