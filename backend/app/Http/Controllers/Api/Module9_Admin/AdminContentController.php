<?php

namespace App\Http\Controllers\Api\Module9_Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Exam;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContentController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Bạn không có quyền truy cập chức năng Admin.');
        }
    }

    /*
    |--------------------------------------------------------------------------
    | QUESTIONS
    |--------------------------------------------------------------------------
    */

    public function questions(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $query = Question::with([
            'subject:id,name',
            'topic:id,name',
            'creator:id,full_name,email',
            'reviewer:id,full_name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where(
                    'content',
                    'like',
                    "%{$search}%"
                )->orWhere(
                    'question_type',
                    'like',
                    "%{$search}%"
                );
            });
        }

        $questions = $query
            ->latest('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách câu hỏi thành công.',
            'data' => $questions,
        ]);
    }

    public function showQuestion(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $question = Question::with([
            'subject',
            'topic',
            'creator:id,full_name,email',
            'reviewer:id,full_name,email',
            'exams:id,title,code',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin câu hỏi thành công.',
            'data' => $question,
        ]);
    }

    public function approveQuestion(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $admin = $request->user();

        $question = Question::findOrFail($id);

        $question->update([
            'status' => 'approved',
            'reviewed_by' => $admin->id,
        ]);

        $this->createLog(
            $request,
            'APPROVE_QUESTION',
            "Admin đã duyệt câu hỏi #{$question->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Duyệt câu hỏi thành công.',
            'data' => $question->fresh(),
        ]);
    }

    public function rejectQuestion(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $admin = $request->user();

        $question = Question::findOrFail($id);

        $question->update([
            'status' => 'rejected',
            'reviewed_by' => $admin->id,
        ]);

        $this->createLog(
            $request,
            'REJECT_QUESTION',
            "Admin đã từ chối câu hỏi #{$question->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Từ chối câu hỏi thành công.',
            'data' => $question->fresh(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | EXAMS
    |--------------------------------------------------------------------------
    */

    public function exams(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $query = Exam::with([
            'subject:id,name',
            'topic:id,name',
            'creator:id,full_name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where(
                    'title',
                    'like',
                    "%{$search}%"
                )->orWhere(
                    'code',
                    'like',
                    "%{$search}%"
                );
            });
        }

        $exams = $query
            ->latest('created_at')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách đề thi thành công.',
            'data' => $exams,
        ]);
    }

    public function showExam(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $exam = Exam::with([
            'subject',
            'topic',
            'creator:id,full_name,email',
            'questions',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin đề thi thành công.',
            'data' => $exam,
        ]);
    }

    public function approveExam(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $exam = Exam::findOrFail($id);

        $exam->update([
            'status' => 'approved',
        ]);

        $this->createLog(
            $request,
            'APPROVE_EXAM',
            "Admin đã duyệt đề thi #{$exam->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Duyệt đề thi thành công.',
            'data' => $exam->fresh(),
        ]);
    }

    public function rejectExam(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $exam = Exam::findOrFail($id);

        $exam->update([
            'status' => 'rejected',
        ]);

        $this->createLog(
            $request,
            'REJECT_EXAM',
            "Admin đã từ chối đề thi #{$exam->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Từ chối đề thi thành công.',
            'data' => $exam->fresh(),
        ]);
    }

    public function hideExam(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $exam = Exam::findOrFail($id);

        $exam->update([
            'status' => 'hidden',
        ]);

        $this->createLog(
            $request,
            'HIDE_EXAM',
            "Admin đã ẩn đề thi #{$exam->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Ẩn đề thi thành công.',
            'data' => $exam->fresh(),
        ]);
    }

    private function createLog(
        Request $request,
        string $action,
        string $description
    ): void {
        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => $action,
            'description' => $description,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
    }
}