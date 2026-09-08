<?php

use App\Http\Controllers\Api\Module1_User\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Module1_User\UserController;
/*
|--------------------------------------------------------------------------
| Module 1: User & Authentication Routes
|--------------------------------------------------------------------------
*/

// Public Routes (Xác thực & Quên mật khẩu)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected Routes (Yêu cầu Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Quản lý hồ sơ & Mật khẩu
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
});