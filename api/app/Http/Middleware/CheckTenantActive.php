<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->tenant && !$user->tenant->is_active) {
            return response()->json([
                'message' => 'Sua conta está suspensa. Entre em contato com o suporte.',
                'error_code' => 'TENANT_SUSPENDED'
            ], 403);
        }

        return $next($request);
    }
}
