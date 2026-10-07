<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class OtpAuthentication
{
    public static function token(Request $request): ?PersonalAccessToken
    {
        $token = $request->bearerToken()
            ? PersonalAccessToken::findToken($request->bearerToken())
            : ($request->hasSession() ? PersonalAccessToken::find($request->session()->get('auth_token_id')) : null);

        if (! $token || $token->tokenable_type !== (new User)->getMorphClass()
            || (string) $token->tokenable_id !== (string) $request->user()?->id
            || ($token->expires_at && $token->expires_at->isPast())) {
            return null;
        }
        if ($request->hasSession() && $request->session()->has('auth_token_id')
            && (string) $request->session()->get('auth_token_id') !== (string) $token->id) {
            return null;
        }

        return $token;
    }

    public static function verified(Request $request): bool
    {
        if ($request->bearerToken() || ($request->hasSession() && $request->session()->has('auth_token_id'))) {
            return in_array('otp_verified', self::token($request)?->abilities ?? [], true);
        }

        // Keep existing cookie-only verified sessions valid until their next sign-in.
        return $request->hasSession() && $request->session()->get('otp_verified') === true
            && (string) $request->session()->get('otp_verified_user_id', $request->user()?->id) === (string) $request->user()?->id;
    }
}
