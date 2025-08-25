<?php

namespace App\Policies;

use App\Models\QuoteStatus;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QuoteStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function view(User $user, QuoteStatus $quoteStatus): bool
    {
        return $user->can('users.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function update(User $user, QuoteStatus $quoteStatus): bool
    {
        return $user->can('users.manage') && $user->id !== $quoteStatus->id;
    }

    public function delete(User $user, QuoteStatus $quoteStatus): bool
    {
        return $user->can('users.manage') && $user->id !== $quoteStatus->id;
    }
}
