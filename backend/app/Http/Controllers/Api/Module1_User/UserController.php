<?php

namespace App\Http\Controllers\Api\Module1_User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Cập nhật thông tin cá nhân (Name, Avatar)
     */
    public function updateProfile(Request $request)
{
    $user = $request->user();

    $validated = $request->validate([
        'full_name'  => 'sometimes|required|string|max:255',
        'email'      => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
        'avatar_url' => 'nullable|url',
    ]);

    $user->update($validated);

    return response()->json([
        'message' => 'Cập nhật thông tin thành công',
        'user'    => $user,
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