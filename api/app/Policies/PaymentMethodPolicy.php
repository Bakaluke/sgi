<?php

namespace App\Policies;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PaymentMethodPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, PaymentMethod $paymentMethod): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('settings.manage');
    }

    public function update(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->can('settings.manage');
    }

    public function delete(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->can('settings.manage');
    }
}
