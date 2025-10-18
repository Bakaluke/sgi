<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        return User::where('id', '!=', $request->user()->id)->paginate(15);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $availableRoles = Role::where('name', '!=', 'admin')->pluck('name')->toArray();

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|min:10|max:11',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in($availableRoles)],
        ]);

        $userData = [
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'],
            'password' => Hash::make($validatedData['password']),
        ];

        $user = User::create($userData);
        
        $user->syncRoles($validatedData['role']);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        $this->authorize('view', $user);

        return $user;
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('update', $user);

        $availableRoles = Role::where('name', '!=', 'admin')->pluck('name')->toArray();
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'required|string|min:10|max:11',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => ['required', Rule::in($availableRoles)],
        ]);

        $userData = [
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'phone' => $validatedData['phone'],
        ];

        if (!empty($validatedData['password'])) {
            $userData['password'] = Hash::make($validatedData['password']);
        }

        $user->update($userData);

        if (!empty($validatedData['role'])) {
            $user->syncRoles($validatedData['role']);
        }

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();
        
        return response()->noContent();
    }
}