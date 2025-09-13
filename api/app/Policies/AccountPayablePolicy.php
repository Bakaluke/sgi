<?php

namespace App\Policies;

use App\Models\AccountPayable;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AccountPayablePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view_payables');
    }
    
    public function create(User $user): bool
    {
        return $user->can('finance.manage_payables');
    }
    
    public function update(User $user, AccountPayable $accountPayable): bool
    {
        return $user->can('finance.manage_payables');
    }
    
    public function delete(User $user, AccountPayable $accountPayable): bool
    {
        return $user->can('finance.manage_payables');
    }
    
    public function registerPayment(User $user, AccountPayable $accountPayable): bool
    {
        return $user->can('finance.manage_payables');
    }
}
