<?php

use App\Http\Controllers\Api\Module2_Instructor\InstructorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Module 2: Quản lý giảng viên / người tạo đề (Content Creator Management)
|--------------------------------------------------------------------------
*/

// ======================= PUBLIC ROUTES =======================
// Tiện ích danh mục môn học
Route::get('/subjects', [InstructorController::class, 'getSubjects']);

// 1. Đăng ký hồ sơ giảng viên (Công khai hoặc người dùng đã đăng nhập)
Route::post('/instructor/register', [InstructorController::class, 'register']);
Route::post('/instructor/upload-evidence', [InstructorController::class, 'uploadEvidence']);

// 6. Danh sách & tìm kiếm giảng viên công khai (cho Người học khám phá nguồn đề uy tín)
Route::get('/instructors/public', [InstructorController::class, 'listPublic']);
Route::get('/instructors/public/{id}', [InstructorController::class, 'getPublicDetail']);

// Admin routes (cung cấp cả chế độ trực tiếp để test linh hoạt và hỗ trợ middleware)
Route::get('/admin/instructors', [InstructorController::class, 'listAdmin']);
Route::post('/admin/instructors/check-overdue', [InstructorController::class, 'checkOverdue']);
Route::post('/admin/instructors/{id}/approve', [InstructorController::class, 'approve']);
Route::post('/admin/instructors/{id}/reject', [InstructorController::class, 'reject']);
Route::post('/admin/instructors/{id}/toggle-status', [InstructorController::class, 'toggleStatus']);
Route::delete('/admin/instructors/{id}', [InstructorController::class, 'deleteInstructor']);

// ==================== INSTRUCTOR PROFILE & COLLABORATOR ROUTES ====================
// Hỗ trợ cả khi có token Sanctum và fallback demo
Route::get('/instructor/my-profile', [InstructorController::class, 'getProfile']);
Route::put('/instructor/my-profile', [InstructorController::class, 'updateProfile']);
Route::get('/instructor/collaborators', [InstructorController::class, 'getCollaborators']);
Route::post('/instructor/collaborators', [InstructorController::class, 'addCollaborator']);
Route::put('/instructor/collaborators/{id}', [InstructorController::class, 'updateCollaborator']);
Route::delete('/instructor/collaborators/{id}', [InstructorController::class, 'removeCollaborator']);

