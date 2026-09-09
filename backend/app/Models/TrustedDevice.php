<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustedDevice extends Model
{
    protected $fillable = [
        'user_id',
        'device_fingerprint',
        'device_name',
        'ip_address',
        'user_agent',
        'last_used_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByFingerprint($query, $fingerprint)
    {
        return $query->where('device_fingerprint', $fingerprint);
    }

    public function scopeForUserByFingerprint($query, $userId, $fingerprint)
    {
        return $query->where('user_id', $userId)
                     ->where('device_fingerprint', $fingerprint);
    }
}
