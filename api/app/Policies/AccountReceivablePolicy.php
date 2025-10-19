<?php

namespace App\Policies;

use App\Models\AccountReceivable;
use App\Models\User;

class AccountReceivablePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view_receivables');
    }

    public function registerPayment(User $user, AccountReceivable $accountReceivable): bool
    {
        return $user->can('finance.register_payment');
    }
}