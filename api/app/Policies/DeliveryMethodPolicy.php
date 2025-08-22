<?php

namespace App\Policies;

use App\Models\DeliveryMethod;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DeliveryMethodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function view(User $user, DeliveryMethod $deliveryMethod): bool
    {
        return $user->can('users.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function update(User $user, DeliveryMethod $deliveryMethod): bool
    {
        return $user->can('users.manage') && $user->id !== $deliveryMethod->id;
    }

    public function delete(User $user, DeliveryMethod $deliveryMethod): bool
    {
        return $user->can('users.manage') && $user->id !== $deliveryMethod->id;
    }
}
