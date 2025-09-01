<?php

namespace App\Policies;

use App\Models\DeliveryMethod;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DeliveryMethodPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DeliveryMethod $deliveryMethod): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('settings.manage');
    }

    public function update(User $user, DeliveryMethod $deliveryMethod): bool
    {
        return $user->can('settings.manage');
    }

    public function delete(User $user, DeliveryMethod $deliveryMethod): bool
    {
        return $user->can('settings.manage');
    }
}
