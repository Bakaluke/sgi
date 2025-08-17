<?php

namespace App\Policies;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PaymentMethodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function view(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->can('users.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('users.manage');
    }

    public function update(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->can('users.manage') && $user->id !== $paymentMethod->id;
    }

    public function delete(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->can('users.manage') && $user->id !== $paymentMethod->id;
    }
}
