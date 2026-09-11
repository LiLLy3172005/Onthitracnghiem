<?php

namespace App\Http\Controllers\Api\Module9_Admin;

use App\Http\Controllers\Controller;
use App\Models\InstructorProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Tìm kiếm, lọc danh sách tài khoản
     * GET /api/admin/users?search=&role=&status=&page=
     */
    public function index(Request $request)
    {
        $query = User::query()->withTrashed(); // withTrashed để Admin thấy cả tài khoản đã khóa/xóa mềm

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            if ($request->status === 'deleted') {
                $query->whereNotNull('deleted_at');
            } else {
                $query->whereNull('deleted_at')->where('status', $request->status);
            }
        }

        $users = $query->orderByDesc('created_at')->paginate(15);

        return response()->json($users);
    }

    /**
     * Admin tạo tài khoản nội bộ (giảng viên/admin) trực tiếp, không cần duyệt
     * POST /api/admin/users
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|string|email|max:255|unique:users',
            'password'  => 'required|string|min:6',
            'role'      => 'required|in:student,instructor,admin',
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'role'      => $validated['role'],
            'status'    => 'active',
        ]);

        // Nếu tạo tài khoản giảng viên, tự động approve luôn vì Admin tự tạo (không cần duyệt lại)
        if ($validated['role'] === 'instructor') {
            InstructorProfile::create([
                'user_id'       => $user->id,
                'verify_status' => 'approved',
                'verified_by'   => $request->user()->id,
                'verified_at'   => now(),
            ]);
        }

        return response()->json(['message' => 'Tạo tài khoản thành công', 'user' => $user], 201);
    }

    /**
     * Duyệt hồ sơ giảng viên tự đăng ký
     * POST /api/admin/users/{id}/approve-instructor
     */
    public function approveInstructor(Request $request, int $id)
    {
        $profile = InstructorProfile::where('user_id', $id)->firstOrFail();
        $profile->update([
            'verify_status' => 'approved',
            'verified_by'   => $request->user()->id,
            'verified_at'   => now(),
        ]);

        return response()->json(['message' => 'Đã duyệt hồ sơ giảng viên', 'profile' => $profile]);
    }

    /**
     * Từ chối hồ sơ giảng viên
     * POST /api/admin/users/{id}/reject-instructor
     */
    public function rejectInstructor(Request $request, int $id)
    {
        $validated = $request->validate(['reject_reason' => 'nullable|string|max:500']);

        $profile = InstructorProfile::where('user_id', $id)->firstOrFail();
        $profile->update([
            'verify_status' => 'rejected',
            'verified_by'   => $request->user()->id,
            'verified_at'   => now(),
            'reject_reason' => $validated['reject_reason'] ?? null,
        ]);

        return response()->json(['message' => 'Đã từ chối hồ sơ giảng viên', 'profile' => $profile]);
    }

    /**
     * Phân quyền tài khoản
     * PUT /api/admin/users/{id}/role
     */
    public function updateRole(Request $request, int $id)
    {
        $validated = $request->validate(['role' => 'required|in:student,instructor,admin']);

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự đổi vai trò của chính mình'], 422);
        }

        $user->update(['role' => $validated['role']]);

        return response()->json(['message' => 'Cập nhật vai trò thành công', 'user' => $user]);
    }

    /**
     * Khóa tài khoản
     * POST /api/admin/users/{id}/lock
     */
    public function lock(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự khóa tài khoản của chính mình'], 422);
        }

        $user->update(['status' => 'locked']);
        $user->tokens()->delete(); // thu hồi luôn token, buộc đăng xuất

        return response()->json(['message' => 'Đã khóa tài khoản', 'user' => $user]);
    }

    /**
     * Mở khóa tài khoản
     * POST /api/admin/users/{id}/unlock
     */
    public function unlock(int $id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        return response()->json(['message' => 'Đã mở khóa tài khoản', 'user' => $user]);
    }

    /**
     * Xóa mềm tài khoản (có thể khôi phục)
     * DELETE /api/admin/users/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Không thể tự xóa tài khoản của chính mình'], 422);
        }

        $user->tokens()->delete();
        $user->delete(); // soft delete nhờ trait SoftDeletes

        return response()->json(['message' => 'Đã xóa tài khoản (có thể khôi phục)']);
    }

    /**
     * Khôi phục tài khoản đã xóa
     * POST /api/admin/users/{id}/restore
     */
    public function restore(int $id)
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json(['message' => 'Đã khôi phục tài khoản', 'user' => $user]);
    }
}