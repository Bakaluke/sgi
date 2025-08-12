<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function before(User $user, string $ability): bool|null
    {
        return $user->role === 'admin' ? true : null;
    }

    public function viewAny(User $user): bool { return false; }
    public function view(User $user, Category $category): bool { return false; }
    public function create(User $user): bool { return false; }
    public function update(User $user, Category $category): bool { return false; }
    public function delete(User $user, Category $category): bool { return false; }
}