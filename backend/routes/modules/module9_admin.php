<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\Module9_Admin\AdminDashboardController;
use App\Http\Controllers\Api\Module9_Admin\AdminContentController;
use App\Http\Controllers\Api\Module9_Admin\AdminReportController;
use App\Http\Controllers\Api\Module9_Admin\AdminCategoryController;
use App\Http\Controllers\Api\Module9_Admin\AdminActivityLogController;

// Route::prefix('admin')
//     ->middleware('auth:sanctum')
//     ->group(function () {

//         /*
//         |--------------------------------------------------------------------------
//         | Dashboard
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/dashboard',
//             [AdminDashboardController::class, 'index']
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Content Moderation - Questions
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/questions',
//             [AdminContentController::class, 'questions']
//         );

//         Route::get(
//             '/questions/{id}',
//             [AdminContentController::class, 'showQuestion']
//         );

//         Route::put(
//             '/questions/{id}/approve',
//             [AdminContentController::class, 'approveQuestion']
//         );

//         Route::put(
//             '/questions/{id}/reject',
//             [AdminContentController::class, 'rejectQuestion']
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Content Moderation - Exams
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/exams',
//             [AdminContentController::class, 'exams']
//         );

//         Route::get(
//             '/exams/{id}',
//             [AdminContentController::class, 'showExam']
//         );

//         Route::put(
//             '/exams/{id}/approve',
//             [AdminContentController::class, 'approveExam']
//         );

//         Route::put(
//             '/exams/{id}/reject',
//             [AdminContentController::class, 'rejectExam']
//         );

//         Route::put(
//             '/exams/{id}/hide',
//             [AdminContentController::class, 'hideExam']
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Reports
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/reports',
//             [AdminReportController::class, 'index']
//         );

//         Route::get(
//             '/reports/{id}',
//             [AdminReportController::class, 'show']
//         );

//         Route::put(
//             '/reports/{id}/resolve',
//             [AdminReportController::class, 'resolve']
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Subjects
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/subjects',
//             [AdminCategoryController::class, 'subjects']
//         );

//         Route::post(
//             '/subjects',
//             [AdminCategoryController::class, 'storeSubject']
//         );

//         Route::put(
//             '/subjects/{id}',
//             [AdminCategoryController::class, 'updateSubject']
//         );

//         Route::delete(
//             '/subjects/{id}',
//             [AdminCategoryController::class, 'deleteSubject']
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Topics
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/subjects/{subjectId}/topics',
//             [AdminCategoryController::class, 'topics']
//         );

//         Route::post(
//             '/topics',
//             [AdminCategoryController::class, 'storeTopic']
//         );

//         Route::put(
//             '/topics/{id}',
//             [AdminCategoryController::class, 'updateTopic']
//         );

//         Route::delete(
//             '/topics/{id}',
//             [AdminCategoryController::class, 'deleteTopic']
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Activity Logs
//         |--------------------------------------------------------------------------
//         */

//         Route::get(
//             '/activity-logs',
//             [AdminActivityLogController::class, 'index']
//         );
//     });

Route::prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/questions', [AdminContentController::class, 'questions']);
        Route::get('/exams', [AdminContentController::class, 'exams']);

        Route::get('/reports', [AdminReportController::class, 'index']);

        Route::get('/subjects', [AdminCategoryController::class, 'subjects']);
        Route::get('/activity-logs', [AdminActivityLogController::class, 'index']);
    });