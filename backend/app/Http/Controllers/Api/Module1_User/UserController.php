<?php

namespace App\Http\Controllers\Api\Module1_User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Cập nhật thông tin cá nhân (Name, Avatar, Phone)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'full_name'  => 'sometimes|required|string|max:255',
            'phone'      => 'nullable|string|max:20',
            'email'      => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'avatar_url' => 'nullable|string|max:1000',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'user'    => $user,
        ]);
    }

    /**
     * Tải lên file ảnh đại diện trực tiếp từ máy tính
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // Tối đa 5MB
        ]);

        $file = $request->file('avatar');
        $safeName = 'avatar_' . $request->user()->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $destinationPath = public_path('uploads/avatars');

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0777, true);
        }

        $file->move($destinationPath, $safeName);
        $avatarUrl = '/uploads/avatars/' . $safeName;

        $request->user()->update(['avatar_url' => $avatarUrl]);

        return response()->json([
            'success'    => true,
            'message'    => 'Tải lên ảnh đại diện thành công',
            'avatar_url' => $avatarUrl,
            'user'       => $request->user(),
        ]);
    }
/**
     * Đổi mật khẩu dành cho người dùng đã đăng nhập
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không chính xác'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }


}