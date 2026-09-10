<?php

use App\Http\Controllers\Api\Module4_Exam\ExamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Module 4: Quan ly De thi / Bo de (Exam & Test Set Management)
|--------------------------------------------------------------------------
*/

Route::prefix('exams')->group(function () {
    Route::get('/',                   [ExamController::class, 'index']);
    Route::post('/',                  [ExamController::class, 'store']);
    Route::post('/auto-generate',     [ExamController::class, 'autoGenerate']);
    Route::get('/{id}',               [ExamController::class, 'show']);
    Route::put('/{id}',               [ExamController::class, 'update']);
    Route::patch('/{id}/status',      [ExamController::class, 'updateStatus']);
    Route::delete('/{id}',            [ExamController::class, 'destroy']);
    Route::get('/{id}/revisions',     [ExamController::class, 'revisions']);
});

Route::get('/exam-resources',         [ExamController::class, 'resources']);