<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyOtp
{
    public function handle(Request $request, Closure $next)
    {
        if (!session('otp_verified')) {
            return response()->json(['message' => 'OTP verification required'], 403);
        }

        return $next($request);
    }
}
