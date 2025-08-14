<?php

namespace App\Policies;

use App\Models\ProductionOrder;
use App\Models\User;

class ProductionOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('production_orders.view') || $user->can('production_orders.view_all');
    }

    public function view(User $user, ProductionOrder $productionOrder): bool
    {
        if ($user->can('production_orders.view_all')) {
            return true;
        }
        if ($user->can('production_orders.view')) {
            return $user->id === $productionOrder->user_id;
        }
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, ProductionOrder $productionOrder): bool
    {
        return $user->can('production_orders.update_status');
    }

    public function delete(User $user, ProductionOrder $productionOrder): bool
    {
        return $user->can('production_orders.delete');
    }
}