<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('role', '!=', 'Admin')
            ->where('um_id', '!=', 1)
            ->where('email', '!=', 'admin@umerch.com')
            ->select('id', 'user_fullname', 'um_id', 'email', 'role', 'status')
            ->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_fullname' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'um_id' => 'required|integer|unique:users,um_id',
            'user_password' => 'required|string|min:6',
        ]);

        $validated['user_password'] = Hash::make($validated['user_password']);
        $validated['role'] = 'customer';
        $validated['status'] = 'active';

        $user = User::create($validated);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'user_fullname' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'um_id' => 'sometimes|integer|unique:users,um_id,' . $id,
            'user_password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['user_password'])) {
            $validated['user_password'] = Hash::make($validated['user_password']);
        } else {
            unset($validated['user_password']);
        }

        $user->update($validated);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        DB::transaction(function () use ($user) {
            $user->delete();
        });

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function deactivate($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['status' => 'inactive']);
        ActivityLog::logDeactivated($user);

        return response()->json(['message' => 'User deactivated successfully']);
    }

    public function reactivate($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['status' => 'active']);
        ActivityLog::logActivated($user);

        return response()->json(['message' => 'User reactivated successfully']);
    }
}
