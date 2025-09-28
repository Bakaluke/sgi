<?php

namespace App\Policies;

use App\Models\ReceivableInstallment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ReceivableInstallmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view_receivables');
    }

    public function view(User $user, ReceivableInstallment $installment): bool
    {
        return false;
    }
    
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, ReceivableInstallment $installment): bool
    {
        return false;
    }

    public function delete(User $user, ReceivableInstallment $installment): bool
    {
        return false;
    }

    public function registerPayment(User $user, ReceivableInstallment $installment): bool
    {
        return $user->can('finance.register_installment_payment');
    }
}