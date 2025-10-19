<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale('pt_BR');

        return $next($request);
    }
}