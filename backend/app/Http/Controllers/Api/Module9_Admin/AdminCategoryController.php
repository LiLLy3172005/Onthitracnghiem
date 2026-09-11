<?php

namespace App\Http\Controllers\Api\Module9_Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Subject;
use App\Models\Topic;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            abort(403, 'Bạn không có quyền truy cập chức năng Admin.');
        }
    }

    public function subjects(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $subjects = Subject::withCount([
            'topics',
            'exams',
            'questions',
        ])->latest('created_at')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách môn học thành công.',
            'data' => $subjects,
        ]);
    }

    public function storeSubject(
        Request $request
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subject = Subject::create($validated);

        $this->log(
            $request,
            'CREATE_SUBJECT',
            "Admin tạo môn học #{$subject->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Thêm môn học thành công.',
            'data' => $subject,
        ], 201);
    }

    public function updateSubject(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subject = Subject::findOrFail($id);

        $subject->update($validated);

        $this->log(
            $request,
            'UPDATE_SUBJECT',
            "Admin cập nhật môn học #{$subject->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật môn học thành công.',
            'data' => $subject->fresh(),
        ]);
    }

    public function deleteSubject(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $subject = Subject::findOrFail($id);

        $subject->delete();

        $this->log(
            $request,
            'DELETE_SUBJECT',
            "Admin xóa môn học #{$id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Xóa môn học thành công.',
            'data' => null,
        ]);
    }

    public function topics(
        Request $request,
        int $subjectId
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $topics = Topic::where(
            'subject_id',
            $subjectId
        )
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách chủ đề thành công.',
            'data' => $topics,
        ]);
    }

    public function storeTopic(
        Request $request
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
        ]);

        $topic = Topic::create($validated);

        $this->log(
            $request,
            'CREATE_TOPIC',
            "Admin tạo chủ đề #{$topic->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Thêm chủ đề thành công.',
            'data' => $topic,
        ], 201);
    }

    public function updateTopic(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'name' => 'required|string|max:255',
        ]);

        $topic = Topic::findOrFail($id);

        $topic->update($validated);

        $this->log(
            $request,
            'UPDATE_TOPIC',
            "Admin cập nhật chủ đề #{$topic->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật chủ đề thành công.',
            'data' => $topic->fresh(),
        ]);
    }

    public function deleteTopic(
        Request $request,
        int $id
    ): JsonResponse {
        $this->authorizeAdmin($request);

        $topic = Topic::findOrFail($id);

        $topic->delete();

        $this->log(
            $request,
            'DELETE_TOPIC',
            "Admin xóa chủ đề #{$id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Xóa chủ đề thành công.',
            'data' => null,
        ]);
    }

    private function log(
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