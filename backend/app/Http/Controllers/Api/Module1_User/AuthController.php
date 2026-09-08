<?php

namespace App\Http\Controllers\Api\Module1_User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    /**
     * Đăng ký tài khoản học viên mới
     */
   public function register(Request $request)
{
    $validated = $request->validate([
        'full_name' => 'required|string|max:255',
        'email'     => 'required|string|email|max:255|unique:users',
        'password'  => 'required|string|min:6',
    ]);

    $user = User::create([
        'full_name' => $validated['full_name'],
        'email'     => $validated['email'],
        'password'  => Hash::make($validated['password']),
        'role'      => 'student',
        'status'    => 'active',
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message'      => 'Đăng ký tài khoản thành công',
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'user'         => $user,
    ], 201);
}
    /**
     * Đăng nhập và tạo Bearer Token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt',
            ], 403);
        }

        // Xóa các token cũ và cấp token mới
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng nhập thành công',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    /**
     * Lấy thông tin user hiện tại
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Đăng xuất và thu hồi token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ]);
    }




    public function forgotPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email',
    ]);

    $user = User::where('email', $request->email)->first();

    // Không tiết lộ email có tồn tại hay không (bảo mật) - luôn trả về cùng 1 message
    if (! $user) {
        return response()->json([
            'message' => 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.',
        ]);
    }

    $token = Str::random(64);

    DB::table('password_resets')->where('email', $user->email)->delete();
    DB::table('password_resets')->insert([
        'email'      => $user->email,
        'token'      => Hash::make($token), // lưu token đã hash, không lưu plain text
        'expires_at' => now()->addMinutes(30),
        'created_at' => now(),
    ]);

    $resetUrl = env('FRONTEND_URL') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

    Mail::to($user->email)->send(new ResetPasswordMail($resetUrl));

    return response()->json([
        'message' => 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.',
    ]);
}

public function resetPassword(Request $request)
{
    $request->validate([
        'email'    => 'required|email',
        'token'    => 'required|string',
        'password' => 'required|string|min:6|confirmed',
    ]);

    $record = DB::table('password_resets')->where('email', $request->email)->first();

    if (! $record || ! Hash::check($request->token, $record->token)) {
        return response()->json(['message' => 'Liên kết không hợp lệ hoặc đã hết hạn'], 400);
    }

    if (now()->gt($record->expires_at)) {
        DB::table('password_resets')->where('email', $request->email)->delete();
        return response()->json(['message' => 'Liên kết đã hết hạn, vui lòng yêu cầu lại'], 400);
    }

    $user = User::where('email', $request->email)->firstOrFail();
    $user->update(['password' => Hash::make($request->password)]);

    // Thu hồi toàn bộ token cũ để đăng xuất khỏi mọi thiết bị
    $user->tokens()->delete();

    DB::table('password_resets')->where('email', $request->email)->delete();

    return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
}
}