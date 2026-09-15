<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function getLogs(Request $request)
    {
        $query = ActivityLog::orderBy('created_at', 'desc')
            ->where('activity_logs_id', '!=', 1)
            ->where('role', '!=', 'admin');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($request->has('activity') && $request->activity) {
            $query->where('action', $request->activity);
        }

        $perPage = $request->get('per_page', 10);
        $logs = $query->paginate($perPage);

        return response()->json($logs);
    }

    public function getStats()
    {
        $totalActivities = ActivityLog::where('role', '!=', 'admin')->count();
        $totalLogins = ActivityLog::where('action', 'Login')->where('role', '!=', 'admin')->count();
        $totalLogouts = ActivityLog::where('action', 'Logout')->where('role', '!=', 'admin')->count();

        return response()->json([
            'total_activities' => $totalActivities,
            'total_logins' => $totalLogins,
            'total_logouts' => $totalLogouts,
        ]);
    }
}
