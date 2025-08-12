<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

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
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|min:10|max:11',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['vendedor', 'producao'])],
        ]);

        $validatedData['password'] = Hash::make($validatedData['password']);
        $user = User::create($validatedData);
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
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'required|string|min:10|max:11',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => ['required', Rule::in(['vendedor', 'producao'])],
        ]);

        if (!empty($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        } else {
            unset($validatedData['password']);
        }

        $user->update($validatedData);
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);
        $user->delete();
        return response()->noContent();
    }
}