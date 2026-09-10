<?php

namespace App\Http\Controllers\Api\Module4_Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamRevision;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ExamController extends Controller
{
    /**
     * GET /exams
     * Danh sách đề thi với filter + stats
     */
    public function index(Request $request): JsonResponse
    {
        $query = Exam::with(['subject', 'topic', 'creator'])
            ->withCount(['revisions', 'attempts'])
            ->whereNull('deleted_at');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($subjectId = $request->input('subject_id')) {
            $query->where('subject_id', $subjectId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($difficulty = $request->input('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        $exams = $query->orderByDesc('updated_at')->get();

        $allExams = Exam::whereNull('deleted_at');
        $stats = [
            'total'     => (clone $allExams)->count(),
            'published' => (clone $allExams)->where('status', 'published')->count(),
            'draft'     => (clone $allExams)->where('status', 'draft')->count(),
            'archived'  => (clone $allExams)->where('status', 'archived')->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $exams,
            'stats'   => $stats,
        ]);
    }

    /**
     * POST /exams
     * Tạo đề thi mới
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'subject_id'        => 'required|exists:subjects,id',
            'topic_id'          => 'nullable|exists:topics,id',
            'difficulty'        => ['required', Rule::in(['easy', 'medium', 'hard', 'mixed'])],
            'duration_minutes'  => 'required|integer|min:1',
            'scoring_method'    => ['required', Rule::in(['equal', 'weighted'])],
            'pass_score'        => 'nullable|numeric|min:0|max:10',
            'max_attempts'      => 'nullable|integer|min:0',
            'shuffle_questions' => 'boolean',
            'shuffle_options'   => 'boolean',
            'show_result_type'  => ['nullable', Rule::in(['immediately', 'after_closed', 'no'])],
            'start_time'        => 'nullable|date',
            'end_time'          => 'nullable|date|after_or_equal:start_time',
            'status'            => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'is_auto_generated' => 'boolean',
            'change_note'       => 'nullable|string|max:500',
            'questions'         => 'nullable|array',
            'questions.*.question_id' => 'required_with:questions|exists:questions,id',
            'questions.*.points'      => 'nullable|numeric|min:0',
            'questions.*.sort_order'  => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $userId = Auth::id() ?? 1;
            $questions = $request->input('questions', []);
            $totalQuestions = count($questions);
            $code = $this->generateExamCode($validated['subject_id']);

            $exam = Exam::create([
                'title'             => $validated['title'],
                'code'              => $code,
                'subject_id'        => $validated['subject_id'],
                'topic_id'          => $validated['topic_id'] ?? null,
                'difficulty'        => $validated['difficulty'],
                'duration_minutes'  => $validated['duration_minutes'],
                'total_questions'   => $totalQuestions,
                'scoring_method'    => $validated['scoring_method'],
                'pass_score'        => $validated['pass_score'] ?? null,
                'max_attempts'      => $validated['max_attempts'] ?? 0,
                'shuffle_questions' => $validated['shuffle_questions'] ?? true,
                'shuffle_options'   => $validated['shuffle_options'] ?? true,
                'show_result_type'  => $validated['show_result_type'] ?? 'immediately',
                'start_time'        => $validated['start_time'] ?? null,
                'end_time'          => $validated['end_time'] ?? null,
                'status'            => $validated['status'] ?? 'draft',
                'is_auto_generated' => $validated['is_auto_generated'] ?? false,
                'created_by'        => $userId,
            ]);

            if (!empty($questions)) {
                $this->syncExamQuestions($exam->id, $questions, $validated['scoring_method']);
            }

            ExamRevision::create([
                'exam_id'    => $exam->id,
                'changed_by' => $userId,
                'change_note'=> $validated['change_note'] ?? "Khởi tạo đề thi với {$totalQuestions} câu hỏi.",
                'created_at' => now(),
            ]);

            DB::commit();

            $exam->load(['subject', 'topic', 'creator', 'examQuestions.question.options']);
            $exam->loadCount(['revisions', 'attempts']);

            return response()->json(['success' => true, 'data' => $exam], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /exams/{id}
     * Chi tiết đề thi + câu hỏi
     */
    public function show(int $id): JsonResponse
    {
        $exam = Exam::with([
            'subject',
            'topic',
            'creator',
            'examQuestions' => fn($q) => $q->orderBy('sort_order'),
            'examQuestions.question.options',
            'examQuestions.question.topic',
        ])
        ->withCount(['revisions', 'attempts'])
        ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $exam]);
    }

    /**
     * PUT /exams/{id}
     * Cập nhật thông tin đề thi và danh sách câu hỏi
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $exam = Exam::findOrFail($id);

        $validated = $request->validate([
            'title'             => 'sometimes|required|string|max:255',
            'subject_id'        => 'sometimes|required|exists:subjects,id',
            'topic_id'          => 'nullable|exists:topics,id',
            'difficulty'        => ['sometimes', Rule::in(['easy', 'medium', 'hard', 'mixed'])],
            'duration_minutes'  => 'sometimes|integer|min:1',
            'scoring_method'    => ['sometimes', Rule::in(['equal', 'weighted'])],
            'pass_score'        => 'nullable|numeric|min:0|max:10',
            'max_attempts'      => 'nullable|integer|min:0',
            'shuffle_questions' => 'boolean',
            'shuffle_options'   => 'boolean',
            'show_result_type'  => ['nullable', Rule::in(['immediately', 'after_closed', 'no'])],
            'start_time'        => 'nullable|date',
            'end_time'          => 'nullable|date',
            'status'            => ['sometimes', Rule::in(['draft', 'published', 'archived'])],
            'change_note'       => 'nullable|string|max:500',
            'questions'         => 'nullable|array',
            'questions.*.question_id' => 'required_with:questions|exists:questions,id',
            'questions.*.points'      => 'nullable|numeric|min:0',
            'questions.*.sort_order'  => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $userId = Auth::id() ?? 1;
            $questions = $request->input('questions');
            $scoringMethod = $validated['scoring_method'] ?? $exam->scoring_method;

            $fillable = [
                'title', 'subject_id', 'topic_id', 'difficulty', 'duration_minutes',
                'scoring_method', 'pass_score', 'max_attempts', 'shuffle_questions',
                'shuffle_options', 'show_result_type', 'start_time', 'end_time', 'status',
            ];

            $updateData = [];
            foreach ($fillable as $field) {
                if (array_key_exists($field, $validated)) {
                    $updateData[$field] = $validated[$field];
                }
            }

            if ($questions !== null) {
                $updateData['total_questions'] = count($questions);
                $this->syncExamQuestions($exam->id, $questions, $scoringMethod);
            }

            $exam->update($updateData);

            ExamRevision::create([
                'exam_id'    => $exam->id,
                'changed_by' => $userId,
                'change_note'=> $validated['change_note'] ?? 'Cập nhật cấu hình và nội dung câu hỏi đề thi.',
                'created_at' => now(),
            ]);

            DB::commit();

            $exam->load(['subject', 'topic', 'creator', 'examQuestions.question.options']);
            $exam->loadCount(['revisions', 'attempts']);

            return response()->json(['success' => true, 'data' => $exam]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * PATCH /exams/{id}/status
     * Thay đổi trạng thái đề thi: draft → published → archived
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $exam = Exam::findOrFail($id);

        $validated = $request->validate([
            'status'      => ['required', Rule::in(['draft', 'published', 'archived'])],
            'change_note' => 'nullable|string|max:500',
        ]);

        $oldStatus = $exam->status;
        $statusLabels = [
            'draft'     => 'Bản nháp',
            'published' => 'Đã xuất bản',
            'archived'  => 'Lưu trữ / Ẩn',
        ];

        $exam->update(['status' => $validated['status']]);

        $userId = Auth::id() ?? 1;
        ExamRevision::create([
            'exam_id'    => $exam->id,
            'changed_by' => $userId,
            'change_note'=> $validated['change_note']
                ?? "Chuyển trạng thái từ \"{$statusLabels[$oldStatus]}\" sang \"{$statusLabels[$validated['status']]}\".",
            'created_at' => now(),
        ]);

        $exam->load(['subject', 'topic', 'creator']);
        $exam->loadCount(['revisions', 'attempts']);

        return response()->json(['success' => true, 'data' => $exam]);
    }

    /**
     * DELETE /exams/{id}
     * Xóa/đóng đề thi an toàn (soft delete nếu đã có lượt làm)
     */
    public function destroy(int $id): JsonResponse
    {
        $exam = Exam::withCount('attempts')->findOrFail($id);

        if ($exam->attempts_count > 0) {
            $exam->update(['status' => 'archived']);
            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => "Đề thi đã có {$exam->attempts_count} lượt làm bài. Đã chuyển sang Lưu trữ và ẩn an toàn để bảo vệ kết quả học viên.",
                'mode'    => 'soft_deleted',
            ]);
        }

        $exam->examQuestions()->delete();
        $exam->revisions()->delete();
        $exam->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa hoàn toàn đề thi.',
            'mode'    => 'deleted',
        ]);
    }

    /**
     * GET /exams/{id}/revisions
     * Lịch sử chỉnh sửa đề thi (Audit Trail)
     */
    public function revisions(int $id): JsonResponse
    {
        $exam = Exam::findOrFail($id);

        $revisions = $exam->revisions()
            ->with('changedBy:id,full_name,role')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $revisions]);
    }

    /**
     * POST /exams/auto-generate
     * Sinh đề ngẫu nhiên từ ngân hàng câu hỏi theo môn, độ khó, số câu
     */
    public function autoGenerate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_id'           => 'required|exists:subjects,id',
            'topic_id'             => 'nullable|exists:topics,id',
            'total_questions'      => 'required|integer|min:1|max:200',
            'easy_percent'         => 'required|integer|min:0|max:100',
            'medium_percent'       => 'required|integer|min:0|max:100',
            'hard_percent'         => 'required|integer|min:0|max:100',
            'exclude_recent_exams' => 'boolean',
        ]);

        $total  = $validated['total_questions'];
        $easy   = (int) round($total * $validated['easy_percent'] / 100);
        $medium = (int) round($total * $validated['medium_percent'] / 100);
        $hard   = max(0, $total - $easy - $medium);

        $baseQuery = Question::with(['options', 'topic'])
            ->where('subject_id', $validated['subject_id'])
            ->where('status', 'published')
            ->whereNull('deleted_at');

        if (!empty($validated['topic_id'])) {
            $baseQuery->where('topic_id', $validated['topic_id']);
        }

        if (!empty($validated['exclude_recent_exams'])) {
            $recentExamIds = Exam::where('subject_id', $validated['subject_id'])
                ->where('status', 'published')
                ->orderByDesc('created_at')
                ->limit(3)
                ->pluck('id');

            if ($recentExamIds->isNotEmpty()) {
                $usedIds = ExamQuestion::whereIn('exam_id', $recentExamIds)->pluck('question_id');
                $baseQuery->whereNotIn('id', $usedIds);
            }
        }

        $pickedEasy   = (clone $baseQuery)->where('difficulty', 'easy')->inRandomOrder()->limit($easy)->get();
        $pickedMedium = (clone $baseQuery)->where('difficulty', 'medium')->inRandomOrder()->limit($medium)->get();
        $pickedHard   = (clone $baseQuery)->where('difficulty', 'hard')->inRandomOrder()->limit($hard)->get();

        $allPicked = $pickedEasy->merge($pickedMedium)->merge($pickedHard)->shuffle();

        $summary = [
            'target_easy'     => $easy,
            'actual_easy'     => $pickedEasy->count(),
            'target_medium'   => $medium,
            'actual_medium'   => $pickedMedium->count(),
            'target_hard'     => $hard,
            'actual_hard'     => $pickedHard->count(),
            'total_requested' => $total,
            'total_picked'    => $allPicked->count(),
            'is_criteria_met' => $allPicked->count() >= $total,
        ];

        return response()->json([
            'success'   => true,
            'summary'   => $summary,
            'questions' => $allPicked->values(),
        ]);
    }

    /**
     * GET /exam-resources
     * Trả về subjects + topics + questions published cho frontend
     */
    public function resources(Request $request): JsonResponse
    {
        $subjects = Subject::with('topics')->get();

        $questionsQuery = Question::with(['options', 'topic'])
            ->where('status', 'published')
            ->whereNull('deleted_at');

        if ($subjectId = $request->input('subject_id')) {
            $questionsQuery->where('subject_id', $subjectId);
        }

        $questions = $questionsQuery->orderByDesc('created_at')->limit(200)->get();

        return response()->json([
            'success'   => true,
            'subjects'  => $subjects,
            'questions' => $questions,
        ]);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function syncExamQuestions(int $examId, array $questions, string $scoringMethod): void
    {
        ExamQuestion::where('exam_id', $examId)->delete();

        $count = count($questions);
        $equalPoints = $count > 0 ? round(10 / $count, 4) : 1.00;

        foreach ($questions as $idx => $q) {
            ExamQuestion::create([
                'exam_id'    => $examId,
                'question_id'=> $q['question_id'],
                'points'     => $scoringMethod === 'equal'
                    ? $equalPoints
                    : (isset($q['points']) ? (float)$q['points'] : $equalPoints),
                'sort_order' => $q['sort_order'] ?? ($idx + 1),
            ]);
        }
    }

    private function generateExamCode(int $subjectId): string
    {
        $subject = Subject::find($subjectId);
        $prefix  = $subject
            ? strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $subject->name), 0, 4))
            : 'EXAM';
        $count = Exam::withTrashed()->count() + 1;
        return "{$prefix}-" . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
