<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::guard('web')->attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $user = Auth::user();
        
        $token = $user->createToken('auth_token')->plainTextToken;
        
        $user->permissions = $user->getAllPermissions()->pluck('name');

        unset($user->roles);
        
        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
}
