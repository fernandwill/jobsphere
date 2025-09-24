<?php

namespace App\Http\Middleware;

use App\Support\Inertia;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests {
    public function handle(Request $request, Closure $next): Response {
        Inertia::share([
            'auth' => [
                'user' => static fn () => request->user()?->only(['id', 'name', 'email', 'avatar']),
            ],
            'flash' => [
                'success' => static fn () => $request->session()->get('success'),
                'error' => static fn () => $request->session()->get('error'),
            ],
            'app' => [
                'name' => config('app.name', 'Laravel'),
            ],
        ]);

        return $next($request);
    }
}