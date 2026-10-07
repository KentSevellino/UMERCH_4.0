<?php

namespace App\Http\Middleware;

use App\Support\OtpAuthentication;
use Closure;
use Illuminate\Http\Request;

class VerifyOtp
{
    public function handle(Request $request, Closure $next)
    {
        if (! OtpAuthentication::verified($request)) {
            return response()->json(['message' => 'OTP verification required'], 403);
        }

        return $next($request);
    }
}
