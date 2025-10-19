<?php

namespace App\Policies;

use App\Models\QuoteStatus;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuoteStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, QuoteStatus $quoteStatus): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('settings.manage');
    }

    public function update(User $user, QuoteStatus $quoteStatus): bool
    {
        return $user->can('settings.manage');
    }

    public function delete(User $user, QuoteStatus $quoteStatus): bool
    {
        return $user->can('settings.manage');
    }
}
