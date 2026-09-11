<?php

use App\Http\Controllers\Api\Module9_Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{id}/role', [AdminUserController::class, 'updateRole']);
    Route::post('/users/{id}/lock', [AdminUserController::class, 'lock']);
    Route::post('/users/{id}/unlock', [AdminUserController::class, 'unlock']);
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
    Route::post('/users/{id}/restore', [AdminUserController::class, 'restore']);
    Route::post('/users/{id}/approve-instructor', [AdminUserController::class, 'approveInstructor']);
    Route::post('/users/{id}/reject-instructor', [AdminUserController::class, 'rejectInstructor']);
});