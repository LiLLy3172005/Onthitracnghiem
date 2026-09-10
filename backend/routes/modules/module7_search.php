<?php

use App\Http\Controllers\Api\Module7_Search\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Module 7: Tìm kiếm & lọc (Search & Filter)
| Theo Tài liệu đặc tả 12 module:
| 1. Tìm kiếm đề thi / câu hỏi theo từ khóa (Người học - MVP)
| 2. Lọc theo môn học, độ khó, số câu (Người học - MVP)
| 3. Lọc kết hợp đa tiêu chí >= 4 tiêu chí < 2 giây (Người học - MVP)
| 4. Sắp xếp kết quả: mới nhất, phổ biến nhất, đánh giá cao nhất (Người học - MVP)
| 5. Tìm kiếm giảng viên / nguồn đề uy tín (Người học - MVP)
|--------------------------------------------------------------------------
*/

Route::prefix('search')->group(function () {
    // 1, 2, 3, 4: Tìm kiếm & Lọc đa tiêu chí đề thi
    Route::get('/exams', [SearchController::class, 'searchExams']);

    // 1: Tìm kiếm & Lọc câu hỏi theo từ khóa
    Route::get('/questions', [SearchController::class, 'searchQuestions']);

    // 5: Tra cứu giảng viên / nguồn đề uy tín
    Route::get('/instructors', [SearchController::class, 'searchInstructors']);

    // 1: Tìm kiếm nhanh toàn hệ thống (OmniSearch)
    Route::get('/omni', [SearchController::class, 'omniSearch']);

    // Metadata hỗ trợ các trường filter động cho Frontend
    Route::get('/meta', [SearchController::class, 'getFilterMetadata']);
});
