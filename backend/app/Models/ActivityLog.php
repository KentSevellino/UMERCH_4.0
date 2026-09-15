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
        'role',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public static function logLogin($user, $role = 'user')
    {
        return self::create([
            'action' => 'Login',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) logged in",
            'role' => $role,
        ]);
    }

    public static function logLogout($user, $role = 'user')
    {
        return self::create([
            'action' => 'Logout',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) logged out",
            'role' => $role,
        ]);
    }

    public static function logDeactivated($user, $role = 'user')
    {
        return self::create([
            'action' => 'Deactivated',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) was deactivated",
            'role' => $role,
        ]);
    }

    public static function logActivated($user, $role = 'user')
    {
        return self::create([
            'action' => 'Activated',
            'description' => "User {$user->user_fullname} (ID: {$user->um_id}) was activated",
            'role' => $role,
        ]);
    }
}
