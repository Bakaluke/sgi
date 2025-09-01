<?php

namespace App\Policies;

use App\Models\ProductionStatus;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductionStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ProductionStatus $productionStatus): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('settings.manage');
    }

    public function update(User $user, ProductionStatus $productionStatus): bool
    {
        return $user->can('settings.manage');
    }

    public function delete(User $user, ProductionStatus $productionStatus): bool
    {
        return $user->can('settings.manage');
    }
}
