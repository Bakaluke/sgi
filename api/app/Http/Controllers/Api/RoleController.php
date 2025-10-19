<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin');
    }

    public function index()
    {
        return Role::with('permissions')->orderBy('name', 'asc')->get();
    }

    public function getPermissions()
    {
        return Permission::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|unique:roles,display_name',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::create([
            'name' => Str::slug($validated['display_name']),
            'display_name' => $validated['display_name'],
            'guard_name' => 'api'
        ]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return response()->json($role, 201);
    }

    public function show(Role $role)
    {
        return $role->load('permissions');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|unique:roles,display_name,'.$role->id,
            'permissions' => 'nullable|array',
        ]);

        $role->update([
            'name' => Str::slug($validated['display_name']),
            'display_name' => $validated['display_name'],
        ]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return response()->json($role->load('permissions'));
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin' || $role->name === 'vendedor' || $role->name === 'producao') {
            abort(403, 'Não é possível apagar os papéis padrão do sistema.');
        }
        $role->delete();
        return response()->noContent();
    }
}