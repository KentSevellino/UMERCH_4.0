<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    protected $primaryKey = 'activity_logs_id';
    public $incrementing = true;
    protected $keyType = 'int';
    const UPDATED_AT = null;

    protected $fillable = [
        'action',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public static function logLogin($user)
    {
        return self::create([
            'action' => 'Login',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) logged in",
        ]);
    }

    public static function logLogout($user)
    {
        return self::create([
            'action' => 'Logout',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) logged out",
        ]);
    }

    public static function logDeactivated($user)
    {
        return self::create([
            'action' => 'Deactivated',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) was deactivated",
        ]);
    }

    public static function logActivated($user)
    {
        return self::create([
            'action' => 'Activated',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) was activated",
        ]);
    }
}
