<?php

namespace App\Http\Controllers\Api\Module9_Admin;


use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\InstructorProfile;
use App\Models\Question;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Bạn không có quyền truy cập chức năng Admin.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $data = [
            'total_students' => User::where('role', 'student')->count(),

            'total_exams' => Exam::count(),

            'total_attempts' => ExamAttempt::count(),

            'active_instructors' => InstructorProfile::where(
                'status',
                'approved'
            )->count(),

            'pending_questions' => Question::where(
                'status',
                'pending'
            )->count(),

            'pending_exams' => Exam::where(
                'status',
                'pending'
            )->count(),

            'pending_reports' => Report::where(
                'status',
                'pending'
            )->count(),

            'recent_activities' => ActivityLog::with(
                'user:id,full_name,email'
            )
                ->latest('created_at')
                ->limit(10)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lấy dữ liệu dashboard thành công.',
            'data' => $data,
        ]);
    }
}
