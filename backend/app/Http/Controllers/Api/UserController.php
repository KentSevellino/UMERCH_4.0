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
        $this->normalizeUmId($request);

        $validated = $request->validate([
            'user_fullname' => 'required|string|max:255|unique:users,user_fullname',
            'email' => 'required|email|max:255|unique:users,email',
            'um_id' => 'required|integer|max:2147483647|unique:users,um_id',
            'user_password' => 'required|string|min:6',
        ], $this->validationMessages());

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

        $this->normalizeUmId($request);

        $validated = $request->validate([
            'user_fullname' => 'sometimes|string|max:255|unique:users,user_fullname,' . (int) $id,
            'email' => 'sometimes|email|max:255|unique:users,email,' . (int) $id,
            'um_id' => 'sometimes|integer|max:2147483647|unique:users,um_id,' . (int) $id,
            'user_password' => 'nullable|string|min:6',
        ], $this->validationMessages());

        if (!empty($validated['user_password'])) {
            $validated['user_password'] = Hash::make($validated['user_password']);
        } else {
            unset($validated['user_password']);
        }

        $user->update($validated);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    private function normalizeUmId(Request $request): void
    {
        $value = $request->input('um_id');

        if (is_string($value) && preg_match('/^0*\d+$/', $value)) {
            $request->merge(['um_id' => ltrim($value, '0') ?: '0']);
        }
    }

    private function validationMessages(): array
    {
        return [
            'user_fullname.required' => 'Full name is required.',
            'user_fullname.unique' => 'This name is already taken.',
            'user_fullname.max' => 'Full name may not be longer than 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email is already taken.',
            'um_id.required' => 'User ID is required.',
            'um_id.integer' => 'User ID must be a whole number.',
            'um_id.max' => 'User ID must be 2147483647 or less.',
            'um_id.unique' => 'This User ID is already in use.',
            'user_password.required' => 'Password is required.',
            'user_password.min' => 'Password must be at least 6 characters.',
        ];
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
        ActivityLog::logDeactivated($user, 'user');

        return response()->json(['message' => 'User deactivated successfully']);
    }

    public function reactivate($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update(['status' => 'active']);
        ActivityLog::logActivated($user, 'user');

        return response()->json(['message' => 'User reactivated successfully']);
    }
}
