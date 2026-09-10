<?php

namespace App\Http\Controllers\Api\Module7_Search;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\InstructorProfile;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Chức năng 1, 2, 3, 4: Tìm kiếm, lọc đa tiêu chí (>=4 tiêu chí) và sắp xếp đề thi.
     * Đáp ứng thời gian phản hồi < 2s kết hợp cache theo Module 10 STT 3.
     */
    public function searchExams(Request $request)
    {
        $startTime = microtime(true);

        $q = trim($request->input('q', ''));
        $subjectId = $request->input('subject_id');
        $topicId = $request->input('topic_id');
        $difficulty = $request->input('difficulty');
        $questionsRange = $request->input('questions_range'); // 'under_20', '20_40', 'over_40'
        $durationRange = $request->input('duration_range');   // 'under_30', '30_60', 'over_60'
        $instructorId = $request->input('instructor_id');
        $sortBy = $request->input('sort_by', 'latest');       // 'latest', 'popular', 'rating'
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 9), 50);

        // Cache key đại diện cho tổ hợp lọc
        $cacheKey = 'search_exams_' . md5(json_encode([
            $q, $subjectId, $topicId, $difficulty, $questionsRange,
            $durationRange, $instructorId, $sortBy, $page, $perPage
        ]));

        $fetcher = function () use (
            $q, $subjectId, $topicId, $difficulty, $questionsRange,
            $durationRange, $instructorId, $sortBy, $page, $perPage
        ) {
            $query = Exam::query()
                ->where('status', 'published')
                ->with(['subject:id,name', 'topic:id,name', 'creator:id,full_name,avatar_url'])
                ->withCount('attempts');

            // 1. Tìm kiếm từ khóa (tên đề thi, mô tả, tên môn học, chủ đề, tên giảng viên)
            if ($q !== '') {
                $query->where(function ($subQ) use ($q) {
                    $subQ->where('title', 'like', "%{$q}%")
                         ->orWhere('description', 'like', "%{$q}%")
                         ->orWhereHas('subject', function ($sQ) use ($q) {
                             $sQ->where('name', 'like', "%{$q}%");
                         })
                         ->orWhereHas('topic', function ($tQ) use ($q) {
                             $tQ->where('name', 'like', "%{$q}%");
                         })
                         ->orWhereHas('creator', function ($cQ) use ($q) {
                             $cQ->where('full_name', 'like', "%{$q}%");
                         });
                });
            }

            // 2. Lọc theo Môn học
            if (!empty($subjectId) && $subjectId !== 'all') {
                $query->where('subject_id', $subjectId);
            }

            // 3. Lọc theo Chủ đề
            if (!empty($topicId) && $topicId !== 'all') {
                $query->where('topic_id', $topicId);
            }

            // 4. Lọc theo Độ khó (easy, medium, hard, mixed)
            if (!empty($difficulty) && $difficulty !== 'all') {
                $query->where('difficulty', $difficulty);
            }

            // 5. Lọc theo Số câu hỏi
            if (!empty($questionsRange) && $questionsRange !== 'all') {
                if ($questionsRange === 'under_20') {
                    $query->where('total_questions', '<', 20);
                } elseif ($questionsRange === '20_40') {
                    $query->whereBetween('total_questions', [20, 40]);
                } elseif ($questionsRange === 'over_40') {
                    $query->where('total_questions', '>', 40);
                }
            }

            // 6. Lọc theo Thời gian làm bài
            if (!empty($durationRange) && $durationRange !== 'all') {
                if ($durationRange === 'under_30') {
                    $query->where('duration_minutes', '<=', 30);
                } elseif ($durationRange === '30_60') {
                    $query->whereBetween('duration_minutes', [31, 60]);
                } elseif ($durationRange === 'over_60') {
                    $query->where('duration_minutes', '>', 60);
                }
            }

            // 7. Lọc theo Giảng viên
            if (!empty($instructorId) && $instructorId !== 'all') {
                $query->where('created_by', $instructorId);
            }

            // Sắp xếp kết quả (Chức năng 4)
            if ($sortBy === 'popular') {
                // Phổ biến nhất: lượt làm bài (attempts) + views
                $query->orderByDesc('attempts_count')->orderByDesc('views_count');
            } elseif ($sortBy === 'rating') {
                // Điểm đánh giá cao nhất
                $query->orderByDesc('rating')->orderByDesc('views_count');
            } else {
                // Mặc định: Mới nhất
                $query->orderByDesc('created_at');
            }

            $paginated = $query->paginate($perPage, ['*'], 'page', $page);

            $pArr = $paginated->toArray();
            return [
                'total'        => $pArr['total'],
                'current_page' => $pArr['current_page'],
                'last_page'    => $pArr['last_page'],
                'per_page'     => $pArr['per_page'],
                'items'        => $pArr['data'],
            ];
        };

        try {
            $data = Cache::remember($cacheKey, 300, $fetcher);
        } catch (\Throwable $e) {
            $data = $fetcher();
        }

        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);

        return response()->json([
            'status'            => 'success',
            'execution_time_ms' => $elapsedMs,
            'under_2_seconds'   => $elapsedMs < 2000,
            'filters_applied'   => [
                'q'               => $q,
                'subject_id'      => $subjectId,
                'topic_id'        => $topicId,
                'difficulty'      => $difficulty,
                'questions_range' => $questionsRange,
                'duration_range'  => $durationRange,
                'instructor_id'   => $instructorId,
                'sort_by'         => $sortBy,
            ],
            'data' => $data,
        ]);
    }

    /**
     * Chức năng 1 (phần câu hỏi): Tìm kiếm câu hỏi theo từ khóa, lọc theo môn & độ khó
     */
    public function searchQuestions(Request $request)
    {
        $startTime = microtime(true);

        $q = trim($request->input('q', ''));
        $subjectId = $request->input('subject_id');
        $topicId = $request->input('topic_id');
        $difficulty = $request->input('difficulty');
        $questionType = $request->input('question_type');
        $sortBy = $request->input('sort_by', 'latest');
        $page = (int) $request->input('page', 1);
        $perPage = min((int) $request->input('per_page', 10), 50);

        $query = Question::query()
            ->where('status', 'published')
            ->with(['subject:id,name', 'topic:id,name', 'options:id,question_id,content,is_correct,sort_order', 'creator:id,full_name']);

        if ($q !== '') {
            $query->where(function ($subQ) use ($q) {
                $subQ->where('content', 'like', "%{$q}%")
                     ->orWhere('explanation', 'like', "%{$q}%");
            });
        }

        if (!empty($subjectId) && $subjectId !== 'all') {
            $query->where('subject_id', $subjectId);
        }

        if (!empty($topicId) && $topicId !== 'all') {
            $query->where('topic_id', $topicId);
        }

        if (!empty($difficulty) && $difficulty !== 'all') {
            $query->where('difficulty', $difficulty);
        }

        if (!empty($questionType) && $questionType !== 'all') {
            $query->where('question_type', $questionType);
        }

        if ($sortBy === 'difficulty_asc') {
            $query->orderByRaw("FIELD(difficulty, 'easy', 'medium', 'hard')");
        } elseif ($sortBy === 'difficulty_desc') {
            $query->orderByRaw("FIELD(difficulty, 'hard', 'medium', 'easy')");
        } else {
            $query->orderByDesc('created_at');
        }

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);
        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);

        $pArr = $paginated->toArray();
        return response()->json([
            'status'            => 'success',
            'execution_time_ms' => $elapsedMs,
            'under_2_seconds'   => $elapsedMs < 2000,
            'data' => [
                'total'        => $pArr['total'],
                'current_page' => $pArr['current_page'],
                'last_page'    => $pArr['last_page'],
                'per_page'     => $pArr['per_page'],
                'items'        => $pArr['data'],
            ],
        ]);
    }

    /**
     * Chức năng 5: Tìm kiếm giảng viên / nguồn đề uy tín
     * Tra cứu giảng viên theo tên hoặc môn học phụ trách, hiển thị số đề đã tạo và rating.
     */
    public function searchInstructors(Request $request)
    {
        $startTime = microtime(true);

        $q = trim($request->input('q', ''));
        $subjectId = $request->input('subject_id');
        $sortBy = $request->input('sort_by', 'rating'); // 'rating', 'popular', 'latest'

        $query = InstructorProfile::query()
            ->where('verify_status', 'approved')
            ->whereHas('user', function ($uQ) {
                $uQ->where('status', 'active');
            })
            ->with([
                'user:id,full_name,email,avatar_url',
                'subjects:id,name',
            ]);

        // Tìm theo tên, chuyên môn hoặc tiểu sử
        if ($q !== '') {
            $query->where(function ($subQ) use ($q) {
                $subQ->where('specialization', 'like', "%{$q}%")
                     ->orWhere('bio', 'like', "%{$q}%")
                     ->orWhereHas('user', function ($uQ) use ($q) {
                         $uQ->where('full_name', 'like', "%{$q}%");
                     });
            });
        }

        // Lọc theo môn học
        if (!empty($subjectId) && $subjectId !== 'all') {
            $query->whereHas('subjects', function ($sQ) use ($subjectId) {
                $sQ->where('subjects.id', $subjectId);
            });
        }

        $instructors = $query->get()->map(function ($profile) {
            $examsCount = Exam::where('created_by', $profile->user_id)->where('status', 'published')->count();
            $questionsCount = Question::where('created_by', $profile->user_id)->count();
            $avgRating = Exam::where('created_by', $profile->user_id)->avg('rating') ?: 4.90;

            return [
                'id'              => $profile->id,
                'user_id'         => $profile->user_id,
                'full_name'       => $profile->user->full_name,
                'avatar_url'      => $profile->user->avatar_url,
                'specialization'  => $profile->specialization,
                'bio'             => $profile->bio,
                'verified_at'     => $profile->verified_at,
                'subjects'        => $profile->subjects->pluck('name'),
                'exams_count'     => $examsCount,
                'questions_count' => $questionsCount,
                'rating'          => round($avgRating, 2),
            ];
        });

        // Sắp xếp
        if ($sortBy === 'rating') {
            $instructors = $instructors->sortByDesc('rating')->values();
        } elseif ($sortBy === 'popular') {
            $instructors = $instructors->sortByDesc('exams_count')->values();
        } else {
            $instructors = $instructors->sortByDesc('verified_at')->values();
        }

        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);

        return response()->json([
            'status'            => 'success',
            'execution_time_ms' => $elapsedMs,
            'under_2_seconds'   => $elapsedMs < 2000,
            'total'             => $instructors->count(),
            'data'              => $instructors,
        ]);
    }

    /**
     * Chức năng 1 (OmniSearch): Tìm kiếm nhanh toàn hệ thống
     * Trả về kết quả tổng hợp phân loại: Đề thi, Câu hỏi, Giảng viên uy tín
     */
    public function omniSearch(Request $request)
    {
        $startTime = microtime(true);
        $q = trim($request->input('q', ''));

        if ($q === '') {
            return response()->json([
                'status' => 'success',
                'data'   => ['exams' => [], 'questions' => [], 'instructors' => []],
                'execution_time_ms' => 0,
            ]);
        }

        // 1. Top 4 đề thi
        $exams = Exam::where('status', 'published')
            ->where(function ($subQ) use ($q) {
                $subQ->where('title', 'like', "%{$q}%")
                     ->orWhere('description', 'like', "%{$q}%")
                     ->orWhereHas('subject', function ($sQ) use ($q) {
                         $sQ->where('name', 'like', "%{$q}%");
                     });
            })
            ->with(['subject:id,name', 'creator:id,full_name'])
            ->withCount('attempts')
            ->limit(4)
            ->get();

        // 2. Top 3 câu hỏi
        $questions = Question::where('status', 'published')
            ->where(function ($subQ) use ($q) {
                $subQ->where('content', 'like', "%{$q}%")
                     ->orWhere('explanation', 'like', "%{$q}%");
            })
            ->with(['subject:id,name', 'topic:id,name'])
            ->limit(3)
            ->get();

        // 3. Top 3 giảng viên
        $instructors = InstructorProfile::where('verify_status', 'approved')
            ->where(function ($subQ) use ($q) {
                $subQ->where('specialization', 'like', "%{$q}%")
                     ->orWhereHas('user', function ($uQ) use ($q) {
                         $uQ->where('full_name', 'like', "%{$q}%");
                     });
            })
            ->with(['user:id,full_name,avatar_url', 'subjects:id,name'])
            ->limit(3)
            ->get()
            ->map(function ($p) {
                return [
                    'id'             => $p->id,
                    'full_name'      => $p->user->full_name,
                    'avatar_url'     => $p->user->avatar_url,
                    'specialization' => $p->specialization,
                    'subjects'       => $p->subjects->pluck('name'),
                ];
            });

        $elapsedMs = round((microtime(true) - $startTime) * 1000, 2);

        return response()->json([
            'status'            => 'success',
            'execution_time_ms' => $elapsedMs,
            'under_2_seconds'   => $elapsedMs < 2000,
            'data' => [
                'exams'       => $exams,
                'questions'   => $questions,
                'instructors' => $instructors,
            ],
        ]);
    }

    /**
     * Metadata cho các bộ lọc trên giao diện (môn học, chủ đề, độ khó, giảng viên)
     */
    public function getFilterMetadata(Request $request)
    {
        $subjects = Subject::all()->map(function ($s) {
            $examCount = Exam::where('subject_id', $s->id)->where('status', 'published')->count();
            $topics = Topic::where('subject_id', $s->id)->get(['id', 'name']);
            return [
                'id'          => $s->id,
                'name'        => $s->name,
                'exam_count'  => $examCount,
                'topics'      => $topics,
            ];
        });

        $instructors = User::where('role', 'instructor')
            ->where('status', 'active')
            ->whereHas('instructorProfile', function ($q) {
                $q->where('verify_status', 'approved');
            })
            ->select('id', 'full_name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'subjects'          => $subjects,
                'instructors'       => $instructors,
                'difficulty_levels' => [
                    ['value' => 'all', 'label' => 'Tất cả độ khó'],
                    ['value' => 'easy', 'label' => '🟢 Dễ (Cơ bản)'],
                    ['value' => 'medium', 'label' => '🟡 Trung bình (Vận dụng)'],
                    ['value' => 'hard', 'label' => '🔴 Khó (Vận dụng cao 9+)'],
                    ['value' => 'mixed', 'label' => '🟣 Đề tổng hợp (Đa cấp độ)'],
                ],
                'questions_ranges' => [
                    ['value' => 'all', 'label' => 'Tất cả số câu'],
                    ['value' => 'under_20', 'label' => '< 20 câu (Test nhanh)'],
                    ['value' => '20_40', 'label' => '20 - 40 câu (Tiêu chuẩn)'],
                    ['value' => 'over_40', 'label' => '> 40 câu (Đề THPTQG 50 câu)'],
                ],
                'duration_ranges' => [
                    ['value' => 'all', 'label' => 'Tất cả thời lượng'],
                    ['value' => 'under_30', 'label' => '≤ 30 phút'],
                    ['value' => '30_60', 'label' => '30 - 60 phút'],
                    ['value' => 'over_60', 'label' => '> 60 phút (Đề 90 phút)'],
                ],
                'sort_options' => [
                    ['value' => 'latest', 'label' => '⚡ Mới nhất'],
                    ['value' => 'popular', 'label' => '🔥 Phổ biến nhất (Lượt làm)'],
                    ['value' => 'rating', 'label' => '⭐ Đánh giá cao nhất (4.9+)'],
                ],
            ],
        ]);
    }
}
