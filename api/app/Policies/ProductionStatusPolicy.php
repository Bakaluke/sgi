<?php

namespace App\Policies;

use App\Models\ProductionStatus;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductionStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function view(User $user, ProductionStatus $productionStatus): bool
    {
        return $user->can('users.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function update(User $user, ProductionStatus $productionStatus): bool
    {
        return $user->can('users.manage') && $user->id !== $productionStatus->id;
    }

    public function delete(User $user, ProductionStatus $productionStatus): bool
    {
        return $user->can('users.manage') && $user->id !== $productionStatus->id;
    }
}
