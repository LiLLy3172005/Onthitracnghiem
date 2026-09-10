<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Module7Seeder extends Seeder
{
    public function run(): void
    {
        // 1. Lấy hoặc kiểm tra môn học
        $math = Subject::where('name', 'Toán học')->first();
        $physics = Subject::where('name', 'Vật lý')->first();
        $chemistry = Subject::where('name', 'Hóa học')->first();
        $biology = Subject::where('name', 'Sinh học')->first();
        $english = Subject::where('name', 'Tiếng Anh')->first();
        $informatics = Subject::where('name', 'Tin học')->first();
        $history = Subject::where('name', 'Lịch sử')->first();

        // 2. Tạo các chủ đề (Topics)
        $topicsData = [
            // Toán
            ['subject_id' => $math->id, 'name' => 'Hàm số & Khảo sát hàm số'],
            ['subject_id' => $math->id, 'name' => 'Mũ & Logarit'],
            ['subject_id' => $math->id, 'name' => 'Nguyên hàm & Tích phân'],
            ['subject_id' => $math->id, 'name' => 'Hình học không gian Oxyz'],
            ['subject_id' => $math->id, 'name' => 'Số phức & Ứng dụng'],
            // Lý
            ['subject_id' => $physics->id, 'name' => 'Dao động cơ học'],
            ['subject_id' => $physics->id, 'name' => 'Sóng cơ & Sóng âm'],
            ['subject_id' => $physics->id, 'name' => 'Dòng điện xoay chiều'],
            ['subject_id' => $physics->id, 'name' => 'Vật lý hạt nhân'],
            // Tiếng Anh
            ['subject_id' => $english->id, 'name' => 'Ngữ pháp 12 thì trọng tâm'],
            ['subject_id' => $english->id, 'name' => 'Từ vựng & Cụm từ THPTQG'],
            ['subject_id' => $english->id, 'name' => 'Kỹ năng đọc hiểu & Điền từ'],
            ['subject_id' => $english->id, 'name' => 'Phát âm & Trọng âm'],
            // Hóa
            ['subject_id' => $chemistry->id, 'name' => 'Este - Lipit'],
            ['subject_id' => $chemistry->id, 'name' => 'Kim loại kiềm & Kiềm thổ'],
            // Tin học
            ['subject_id' => $informatics->id, 'name' => 'Cấu trúc dữ liệu & Thuật toán'],
            ['subject_id' => $informatics->id, 'name' => 'Lập trình Python cơ bản'],
            // Lịch sử
            ['subject_id' => $history->id, 'name' => 'Lịch sử Việt Nam 1945 - 1975'],
        ];

        $topicModels = [];
        foreach ($topicsData as $t) {
            $topic = Topic::firstOrCreate(
                ['subject_id' => $t['subject_id'], 'name' => $t['name']]
            );
            $topicModels[$t['name']] = $topic;
        }

        // 3. Giảng viên tạo đề
        $gvAn = User::where('email', 'gv_toan@brainblitz.vn')->first();
        $gvBich = User::where('email', 'gv_anh@brainblitz.vn')->first();
        $gvCuong = User::where('email', 'gv_ly@brainblitz.vn')->first();
        $admin = User::where('role', 'admin')->first();
        $student = User::where('role', 'student')->first();

        // Fallback user nếu chưa có
        $fallbackId = $gvAn ? $gvAn->id : ($admin ? $admin->id : 1);

        // 4. Tạo các đề thi mẫu đa dạng theo tiêu chí Module 7
        $examsData = [
            [
                'title' => 'Đề thi thử THPT Quốc Gia 2026 - Môn Toán (Đề số 01)',
                'description' => 'Bộ đề chuẩn cấu trúc ma trận Bộ GD&ĐT năm 2026 gồm 50 câu hỏi phân hóa từ nhận biết đến vận dụng cao, có giải chi tiết và mẹo Casio.',
                'subject_id' => $math->id,
                'topic_id' => $topicModels['Hàm số & Khảo sát hàm số']->id ?? null,
                'difficulty' => 'hard',
                'duration_minutes' => 90,
                'total_questions' => 50,
                'pass_score' => 5.0,
                'status' => 'published',
                'rating' => 4.95,
                'views_count' => 1420,
                'created_by' => $gvAn ? $gvAn->id : $fallbackId,
                'attempts_seed' => 38,
            ],
            [
                'title' => 'Chuyên đề Nguyên hàm & Tích phân - Ôn thi cấp tốc',
                'description' => 'Tổng hợp 25 câu hỏi trắc nghiệm trọng tâm tích phân từng phần, ứng dụng hình học tính diện tích thể tích.',
                'subject_id' => $math->id,
                'topic_id' => $topicModels['Nguyên hàm & Tích phân']->id ?? null,
                'difficulty' => 'medium',
                'duration_minutes' => 45,
                'total_questions' => 25,
                'pass_score' => 6.0,
                'status' => 'published',
                'rating' => 4.88,
                'views_count' => 890,
                'created_by' => $gvAn ? $gvAn->id : $fallbackId,
                'attempts_seed' => 24,
            ],
            [
                'title' => 'Kiểm tra 15 phút: Mũ và Phương trình Logarit cơ bản',
                'description' => 'Bài test nhanh rèn luyện phản xạ tính toán và điều kiện xác định của hàm số mũ, logarit.',
                'subject_id' => $math->id,
                'topic_id' => $topicModels['Mũ & Logarit']->id ?? null,
                'difficulty' => 'easy',
                'duration_minutes' => 15,
                'total_questions' => 10,
                'pass_score' => 7.0,
                'status' => 'published',
                'rating' => 4.70,
                'views_count' => 650,
                'created_by' => $gvAn ? $gvAn->id : $fallbackId,
                'attempts_seed' => 45,
            ],
            [
                'title' => 'Đề Đánh Giá Năng Lực ĐHQG 2026 - Phần Tư Duy Định Lượng',
                'description' => '30 câu hỏi tư duy logic toán học, xử lý số liệu biểu đồ và toán thực tế.',
                'subject_id' => $math->id,
                'topic_id' => $topicModels['Hàm số & Khảo sát hàm số']->id ?? null,
                'difficulty' => 'mixed',
                'duration_minutes' => 60,
                'total_questions' => 30,
                'pass_score' => 6.0,
                'status' => 'published',
                'rating' => 4.92,
                'views_count' => 1100,
                'created_by' => $gvAn ? $gvAn->id : $fallbackId,
                'attempts_seed' => 29,
            ],
            [
                'title' => 'Đề thi thử THPT Quốc Gia - Tiếng Anh 2026 (Format mới)',
                'description' => '50 câu hỏi bám sát cấu trúc mới: Bài đọc hiểu thời sự, ngữ pháp nâng cao, trắc nghiệm từ đồng nghĩa - trái nghĩa.',
                'subject_id' => $english->id,
                'topic_id' => $topicModels['Từ vựng & Cụm từ THPTQG']->id ?? null,
                'difficulty' => 'hard',
                'duration_minutes' => 60,
                'total_questions' => 50,
                'pass_score' => 5.0,
                'status' => 'published',
                'rating' => 4.98,
                'views_count' => 2100,
                'created_by' => $gvBich ? $gvBich->id : $fallbackId,
                'attempts_seed' => 62,
            ],
            [
                'title' => 'Chinh phục 12 Thì Tiếng Anh trong 30 phút',
                'description' => 'Bộ 20 câu hỏi trọng tâm giúp học viên phân biệt thì Hiện tại hoàn thành và Quá khứ đơn, cách dùng Since/For.',
                'subject_id' => $english->id,
                'topic_id' => $topicModels['Ngữ pháp 12 thì trọng tâm']->id ?? null,
                'difficulty' => 'easy',
                'duration_minutes' => 30,
                'total_questions' => 20,
                'pass_score' => 7.0,
                'status' => 'published',
                'rating' => 4.85,
                'views_count' => 980,
                'created_by' => $gvBich ? $gvBich->id : $fallbackId,
                'attempts_seed' => 51,
            ],
            [
                'title' => 'Luyện kỹ năng Đọc hiểu Tiếng Anh B2 - C1',
                'description' => '25 câu hỏi trắc nghiệm đoạn văn khoa học và xã hội, phân tích từ vựng theo ngữ cảnh.',
                'subject_id' => $english->id,
                'topic_id' => $topicModels['Kỹ năng đọc hiểu & Điền từ']->id ?? null,
                'difficulty' => 'medium',
                'duration_minutes' => 45,
                'total_questions' => 25,
                'pass_score' => 6.0,
                'status' => 'published',
                'rating' => 4.79,
                'views_count' => 730,
                'created_by' => $gvBich ? $gvBich->id : $fallbackId,
                'attempts_seed' => 19,
            ],
            [
                'title' => 'Đề kiểm tra Dao động cơ học & Con lắc lò xo',
                'description' => '40 câu hỏi trắc nghiệm Vật lý 12 phần Dao động điều hòa, đồ thị ly độ thời gian và bài toán va chạm.',
                'subject_id' => $physics->id,
                'topic_id' => $topicModels['Dao động cơ học']->id ?? null,
                'difficulty' => 'medium',
                'duration_minutes' => 50,
                'total_questions' => 40,
                'pass_score' => 5.0,
                'status' => 'published',
                'rating' => 4.89,
                'views_count' => 1250,
                'created_by' => $gvCuong ? $gvCuong->id : $fallbackId,
                'attempts_seed' => 34,
            ],
            [
                'title' => 'Chuyên đề Sóng cơ & Giao thoa sóng - Vận dụng cao 9+',
                'description' => '20 câu hỏi khó phân loại thí sinh về cực đại giao thoa và khoảng cách nguồn sóng.',
                'subject_id' => $physics->id,
                'topic_id' => $topicModels['Sóng cơ & Sóng âm']->id ?? null,
                'difficulty' => 'hard',
                'duration_minutes' => 45,
                'total_questions' => 20,
                'pass_score' => 6.0,
                'status' => 'published',
                'rating' => 4.91,
                'views_count' => 820,
                'created_by' => $gvCuong ? $gvCuong->id : $fallbackId,
                'attempts_seed' => 15,
            ],
            [
                'title' => 'Lý thuyết Vật lý Hạt nhân - Trắc nghiệm ăn điểm nhanh',
                'description' => '15 câu hỏi trắc nghiệm lý thuyết độ hụt khối, năng lượng liên kết và phóng xạ.',
                'subject_id' => $physics->id,
                'topic_id' => $topicModels['Vật lý hạt nhân']->id ?? null,
                'difficulty' => 'easy',
                'duration_minutes' => 15,
                'total_questions' => 15,
                'pass_score' => 8.0,
                'status' => 'published',
                'rating' => 4.65,
                'views_count' => 540,
                'created_by' => $gvCuong ? $gvCuong->id : $fallbackId,
                'attempts_seed' => 28,
            ],
            [
                'title' => 'Tổng ôn Este - Lipit & Peptit Hóa học 12',
                'description' => '30 câu hỏi trắc nghiệm Hóa hữu cơ: danh pháp, phản ứng xà phòng hóa và bảo toàn khối lượng.',
                'subject_id' => $chemistry->id,
                'topic_id' => $topicModels['Este - Lipit']->id ?? null,
                'difficulty' => 'medium',
                'duration_minutes' => 40,
                'total_questions' => 30,
                'pass_score' => 6.0,
                'status' => 'published',
                'rating' => 4.80,
                'views_count' => 610,
                'created_by' => $fallbackId,
                'attempts_seed' => 22,
            ],
            [
                'title' => 'Trắc nghiệm Nhập môn Lập trình Python & Cấu trúc rẽ nhánh',
                'description' => '20 câu trắc nghiệm kiểm tra cú pháp Python, kiểu dữ liệu, vòng lặp for/while và hàm.',
                'subject_id' => $informatics->id,
                'topic_id' => $topicModels['Lập trình Python cơ bản']->id ?? null,
                'difficulty' => 'easy',
                'duration_minutes' => 25,
                'total_questions' => 20,
                'pass_score' => 7.0,
                'status' => 'published',
                'rating' => 4.93,
                'views_count' => 920,
                'created_by' => $gvAn ? $gvAn->id : $fallbackId,
                'attempts_seed' => 31,
            ],
            [
                'title' => 'Lịch sử Việt Nam giai đoạn kháng chiến chống Mỹ (1954 - 1975)',
                'description' => '40 câu hỏi trắc nghiệm các chiến lược chiến tranh và mốc sự kiện lịch sử quan trọng.',
                'subject_id' => $history->id,
                'topic_id' => $topicModels['Lịch sử Việt Nam 1945 - 1975']->id ?? null,
                'difficulty' => 'medium',
                'duration_minutes' => 45,
                'total_questions' => 40,
                'pass_score' => 5.0,
                'status' => 'published',
                'rating' => 4.75,
                'views_count' => 490,
                'created_by' => $fallbackId,
                'attempts_seed' => 16,
            ],
        ];

        foreach ($examsData as $ed) {
            $attemptsSeed = $ed['attempts_seed'];
            unset($ed['attempts_seed']);

            $exam = Exam::updateOrCreate(
                ['title' => $ed['title']],
                $ed
            );

            // 5. Tạo câu hỏi mẫu gắn với đề thi này (5 câu hỏi thực tế mỗi đề)
            $sampleQuestions = [
                [
                    'content' => "Cho hàm số \$y = f(x)\$ có bảng biến thiên trên đoạn [-2; 3]. Giá trị cực đại của hàm số đã cho bằng bao nhiêu?",
                    'explanation' => "Dựa vào bảng biến thiên, tại điểm \$x = 1\$ đạo hàm đổi dấu từ dương sang âm, do đó hàm số đạt cực đại tại \$x = 1\$ với \$y_{CĐ} = 5\$.",
                    'difficulty' => 'easy',
                    'options' => [
                        ['content' => 'Giá trị cực đại y = 5', 'is_correct' => true],
                        ['content' => 'Giá trị cực đại y = -2', 'is_correct' => false],
                        ['content' => 'Giá trị cực đại y = 3', 'is_correct' => false],
                        ['content' => 'Giá trị cực đại y = 1', 'is_correct' => false],
                    ],
                ],
                [
                    'content' => "Tìm tập nghiệm \$S\$ của bất phương trình \$\\log_2(x - 1) < 3\$.",
                    'explanation' => "Điều kiện xác định: \$x - 1 > 0 \Leftrightarrow x > 1\$. BPT tương đương: \$x - 1 < 2^3 = 8 \Leftrightarrow x < 9\$. Kết hợp điều kiện: \$S = (1; 9)\$.",
                    'difficulty' => 'medium',
                    'options' => [
                        ['content' => 'S = (1; 9)', 'is_correct' => true],
                        ['content' => 'S = (-∞; 9)', 'is_correct' => false],
                        ['content' => 'S = (1; 8)', 'is_correct' => false],
                        ['content' => 'S = (0; 9)', 'is_correct' => false],
                    ],
                ],
                [
                    'content' => "Trong không gian \$Oxyz\$, cho mặt phẳng \$(P): 2x - y + 2z - 5 = 0\$. Vectơ nào sau đây là một vectơ pháp tuyến của \$(P)\$?",
                    'explanation' => "Vectơ pháp tuyến của mặt phẳng \$(P): Ax + By + Cz + D = 0\$ là \$\\vec{n} = (A; B; C) = (2; -1; 2)\$.",
                    'difficulty' => 'easy',
                    'options' => [
                        ['content' => 'n = (2; -1; 2)', 'is_correct' => true],
                        ['content' => 'n = (2; 1; 2)', 'is_correct' => false],
                        ['content' => 'n = (2; -1; -5)', 'is_correct' => false],
                        ['content' => 'n = (-2; -1; 2)', 'is_correct' => false],
                    ],
                ],
            ];

            foreach ($sampleQuestions as $idx => $qData) {
                $q = Question::firstOrCreate(
                    [
                        'subject_id' => $exam->subject_id,
                        'content' => $qData['content'],
                    ],
                    [
                        'topic_id' => $exam->topic_id,
                        'explanation' => $qData['explanation'],
                        'difficulty' => $qData['difficulty'],
                        'question_type' => 'single_choice',
                        'status' => 'published',
                        'created_by' => $exam->created_by,
                    ]
                );

                // Options
                foreach ($qData['options'] as $sOrd => $opt) {
                    QuestionOption::firstOrCreate(
                        [
                            'question_id' => $q->id,
                            'content' => $opt['content'],
                        ],
                        [
                            'is_correct' => $opt['is_correct'],
                            'sort_order' => $sOrd + 1,
                        ]
                    );
                }

                // Gắn question vào exam qua pivot
                DB::table('exam_questions')->updateOrInsert(
                    ['exam_id' => $exam->id, 'question_id' => $q->id],
                    ['points' => 1.0, 'sort_order' => $idx + 1]
                );
            }

            // Tạo các lượt làm bài mẫu (attempts) để test sắp xếp theo độ phổ biến (popular)
            if ($student) {
                $currentAttempts = ExamAttempt::where('exam_id', $exam->id)->count();
                $needToAdd = $attemptsSeed - $currentAttempts;
                for ($k = 0; $k < $needToAdd; $k++) {
                    ExamAttempt::create([
                        'exam_id' => $exam->id,
                        'user_id' => $student->id,
                        'status' => 'graded',
                        'mode' => 'practice',
                        'started_at' => now()->subHours(rand(1, 120)),
                        'submitted_at' => now()->subHours(rand(0, 119)),
                        'duration_taken_seconds' => rand(600, 3600),
                        'total_score' => rand(60, 100) / 10,
                        'correct_count' => rand(15, 45),
                        'wrong_count' => rand(1, 10),
                    ]);
                }
            }
        }

        echo "Module 7 Seeding completed: " . count($examsData) . " exams, " . count($topicsData) . " topics, questions and sample attempts created!\n";
    }
}
