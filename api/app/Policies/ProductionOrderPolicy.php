<?php
namespace App\Policies;

use App\Models\ProductionOrder;
use App\Models\User;

class ProductionOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'producao', 'vendedor']);
    }

    public function view(User $user, ProductionOrder $productionOrder): bool
    {
        if (in_array($user->role, ['admin', 'producao'])) {
            return true;
        }
        
        return $user->id === $productionOrder->quote->user_id;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, ProductionOrder $productionOrder): bool
    {
        return in_array($user->role, ['admin', 'producao']);
    }

    public function delete(User $user, ProductionOrder $productionOrder): bool
    {
        return $user->role === 'admin';
    }
}