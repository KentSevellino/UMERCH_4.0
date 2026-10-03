<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyOtp
{
    public function handle(Request $request, Closure $next)
    {
        if (session('otp_verified')) {
            return $next($request);
        }

        // Sanctum's `can()` treats a default `['*']` abilities array as every
        // ability, so it would let any unverified token straight through. The
        // grant has to be explicit: only a token that has actually solved the
        // challenge carries `otp_verified`.
        $abilities = $request->user()?->currentAccessToken()?->abilities ?? [];

        if (! is_array($abilities) || ! in_array('otp_verified', $abilities, true)) {
            return response()->json(['message' => 'OTP verification required'], 403);
        }

        return $next($request);
    }
}
