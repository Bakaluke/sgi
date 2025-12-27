<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        if ($user->tenant && !$user->tenant->is_active) {
            return response()->json([
                'message' => 'O acesso da sua empresa está suspenso. Entre em contato com o suporte.',
                'error_code' => 'TENANT_SUSPENDED'
            ], 403);
        }
        
        $token = $user->createToken($request->device_name ?? 'web')->plainTextToken;
        
        return response()->json([
            'token' => $token,
            'user' => $user->load(['tenant', 'roles', 'permissions']),
        ]);
    }

    public function impersonate(User $user)
    {
        $token = $user->createToken('ImpersonationToken')->plainTextToken;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        
        return redirect("$frontendUrl/login-via-token?token=$token");
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Deslogado com sucesso']);
    }
}