<?php

namespace App\Policies;

use App\Models\NegotiationSource;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NegotiationSourcePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function view(User $user, NegotiationSource $negotiationSource): bool
    {
        return $user->can('users.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function update(User $user, NegotiationSource $negotiationSource): bool
    {
        return $user->can('users.manage') && $user->id !== $negotiationSource->id;
    }

    public function delete(User $user, NegotiationSource $negotiationSource): bool
    {
        return $user->can('users.manage') && $user->id !== $negotiationSource->id;
    }
}
