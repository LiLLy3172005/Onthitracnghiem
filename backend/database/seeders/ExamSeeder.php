<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\ExamRevision;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo Giảng viên nếu chưa có
        $lecturer = User::firstOrCreate(
            ['email' => 'hoangnam@brainblitz.edu.vn'],
            [
                'full_name' => 'ThS. Hoàng Nam',
                'password' => Hash::make('password123'),
                'role' => 'instructor',
                'status' => 'active',
            ]
        );

        // 2. Tạo các Môn học mẫu
        $webSubject = Subject::firstOrCreate(
            ['name' => 'Lập trình Web'],
            ['description' => 'Phát triển ứng dụng Web Frontend và Backend hiện đại']
        );

        $mathSubject = Subject::firstOrCreate(
            ['name' => 'Toán rời rạc'],
            ['description' => 'Logic mệnh đề, đồ thị và đại số Boolean']
        );

        $netSubject = Subject::firstOrCreate(
            ['name' => 'Mạng máy tính'],
            ['description' => 'Mô hình OSI, TCP/IP và cấu hình định tuyến']
        );

        $engSubject = Subject::firstOrCreate(
            ['name' => 'Tiếng Anh chuyên ngành'],
            ['description' => 'Từ vựng và ngữ cảnh kỹ thuật ngành CNTT']
        );

        // 3. Tạo Chủ đề (Topics)
        $reactTopic = Topic::firstOrCreate(
            ['subject_id' => $webSubject->id, 'name' => 'ReactJS, Virtual DOM & State Management'],
            ['description' => 'Kiến thức chuyên sâu về React framework']
        );

        $graphTopic = Topic::firstOrCreate(
            ['subject_id' => $mathSubject->id, 'name' => 'Lý thuyết Đồ thị & Logic'],
            ['description' => 'Cây khung, đường đi ngắn nhất']
        );

        // 4. Tạo các Câu hỏi mẫu cho môn Web
        $q1 = Question::firstOrCreate(
            [
                'subject_id' => $webSubject->id,
                'content' => 'Trong React 19, hook nào sau đây được sử dụng để xử lý tác vụ bất đồng bộ (Async actions) và quản lý trạng thái pending trực tiếp trong form?',
            ],
            [
                'topic_id' => $reactTopic->id,
                'explanation' => 'Hook useActionState trong React 19 hỗ trợ xử lý tác vụ bất đồng bộ và trả về [state, formAction, isPending].',
                'difficulty' => 'medium',
                'question_type' => 'single_choice',
                'status' => 'published',
                'created_by' => $lecturer->id,
            ]
        );

        if ($q1->wasRecentlyCreated) {
            QuestionOption::create(['question_id' => $q1->id, 'content' => 'useFormStatus', 'is_correct' => false, 'sort_order' => 1]);
            QuestionOption::create(['question_id' => $q1->id, 'content' => 'useActionState', 'is_correct' => true, 'sort_order' => 2]);
            QuestionOption::create(['question_id' => $q1->id, 'content' => 'useOptimistic', 'is_correct' => false, 'sort_order' => 3]);
            QuestionOption::create(['question_id' => $q1->id, 'content' => 'useTransition', 'is_correct' => false, 'sort_order' => 4]);
        }

        $q2 = Question::firstOrCreate(
            [
                'subject_id' => $webSubject->id,
                'content' => 'Virtual DOM trong React giúp tối ưu hiệu năng render của trình duyệt bằng cơ chế nào sau đây?',
            ],
            [
                'topic_id' => $reactTopic->id,
                'explanation' => 'React sử dụng Diffing algorithm để so sánh cây VDOM và thực hiện Batch update lên Real DOM.',
                'difficulty' => 'easy',
                'question_type' => 'single_choice',
                'status' => 'published',
                'created_by' => $lecturer->id,
            ]
        );

        if ($q2->wasRecentlyCreated) {
            QuestionOption::create(['question_id' => $q2->id, 'content' => 'Thao tác trực tiếp với GPU của máy khách', 'is_correct' => false, 'sort_order' => 1]);
            QuestionOption::create(['question_id' => $q2->id, 'content' => 'Bỏ qua hoàn toàn render tree của trình duyệt', 'is_correct' => false, 'sort_order' => 2]);
            QuestionOption::create(['question_id' => $q2->id, 'content' => 'Diffing algorithm & Batch updates lên Real DOM', 'is_correct' => true, 'sort_order' => 3]);
            QuestionOption::create(['question_id' => $q2->id, 'content' => 'Sử dụng Web Assembly biên dịch sang mã máy', 'is_correct' => false, 'sort_order' => 4]);
        }

        $q3 = Question::firstOrCreate(
            [
                'subject_id' => $webSubject->id,
                'content' => 'Khi sử dụng useEffect với mảng phụ thuộc rỗng [], hàm cleanup trả về sẽ được kích hoạt tại thời điểm nào trong lifecycle của component?',
            ],
            [
                'topic_id' => $reactTopic->id,
                'explanation' => 'Với dependency array rỗng [], effect chỉ chạy một lần sau mount và hàm cleanup chỉ chạy khi component unmount.',
                'difficulty' => 'hard',
                'question_type' => 'single_choice',
                'status' => 'published',
                'created_by' => $lecturer->id,
            ]
        );

        if ($q3->wasRecentlyCreated) {
            QuestionOption::create(['question_id' => $q3->id, 'content' => 'Khi component unmount khỏi DOM', 'is_correct' => true, 'sort_order' => 1]);
            QuestionOption::create(['question_id' => $q3->id, 'content' => 'Trước mỗi lần component re-render', 'is_correct' => false, 'sort_order' => 2]);
            QuestionOption::create(['question_id' => $q3->id, 'content' => 'Ngay sau khi DOM được vẽ xong', 'is_correct' => false, 'sort_order' => 3]);
            QuestionOption::create(['question_id' => $q3->id, 'content' => 'Khi state con thay đổi', 'is_correct' => false, 'sort_order' => 4]);
        }

        // 5. Tạo 4 đề thi mẫu chuẩn theo Mockup
        // Đề 1: Kiểm tra giữa kỳ - Lập trình Web Frontend
        $exam1 = Exam::firstOrCreate(
            ['title' => 'Kiểm tra giữa kỳ - Lập trình Web Frontend'],
            [
                'subject_id' => $webSubject->id,
                'topic_id' => $reactTopic->id,
                'difficulty' => 'medium',
                'duration_minutes' => 60,
                'total_questions' => 40,
                'scoring_method' => 'equal',
                'pass_score' => 5.0,
                'max_attempts' => 1,
                'shuffle_questions' => true,
                'shuffle_options' => true,
                'status' => 'published',
                'created_by' => $lecturer->id,
            ]
        );

        ExamQuestion::firstOrCreate(['exam_id' => $exam1->id, 'question_id' => $q1->id], ['points' => 3.33, 'sort_order' => 1]);
        ExamQuestion::firstOrCreate(['exam_id' => $exam1->id, 'question_id' => $q2->id], ['points' => 3.33, 'sort_order' => 2]);
        ExamQuestion::firstOrCreate(['exam_id' => $exam1->id, 'question_id' => $q3->id], ['points' => 3.34, 'sort_order' => 3]);

        // Tạo Revisions mẫu cho Đề 1
        ExamRevision::firstOrCreate(
            ['exam_id' => $exam1->id, 'change_note' => 'Khởi tạo đề thi với 30 câu hỏi ban đầu từ ngân hàng câu hỏi.'],
            ['changed_by' => $lecturer->id, 'created_at' => now()->subDays(7)]
        );
        ExamRevision::firstOrCreate(
            ['exam_id' => $exam1->id, 'change_note' => 'Thay đổi cách tính điểm từ "Trọng số từng câu" sang "Chia đều 10 điểm cho 35 câu". Cập nhật độ khó sang mức Trung bình.'],
            ['changed_by' => $lecturer->id, 'created_at' => now()->subDays(3)]
        );
        ExamRevision::firstOrCreate(
            ['exam_id' => $exam1->id, 'change_note' => 'Chuyển trạng thái từ "Bản nháp" sang "Đã xuất bản". Điều chỉnh thời gian làm bài từ 45 phút lên 60 phút. Bổ sung 5 câu hỏi React 19 Actions.'],
            ['changed_by' => $lecturer->id, 'created_at' => now()->subHours(5)]
        );

        // Đề 2: Đề ôn luyện Logic Mệnh đề & Đồ thị
        $exam2 = Exam::firstOrCreate(
            ['title' => 'Đề ôn luyện Logic Mệnh đề & Đồ thị'],
            [
                'subject_id' => $mathSubject->id,
                'topic_id' => $graphTopic->id,
                'difficulty' => 'hard',
                'duration_minutes' => 45,
                'total_questions' => 25,
                'scoring_method' => 'weighted',
                'pass_score' => 6.0,
                'max_attempts' => 3,
                'shuffle_questions' => true,
                'shuffle_options' => true,
                'status' => 'draft',
                'is_auto_generated' => true,
                'created_by' => $lecturer->id,
            ]
        );
        ExamRevision::firstOrCreate(
            ['exam_id' => $exam2->id, 'change_note' => 'Sinh tự động bởi AI từ ngân hàng câu hỏi Toán rời rạc theo tỉ lệ 40% TB - 60% Khó.'],
            ['changed_by' => $lecturer->id, 'created_at' => now()->subDays(1)]
        );

        // Đề 3: Thi thử Giao thức TCP/IP và Định tuyến Router
        $exam3 = Exam::firstOrCreate(
            ['title' => 'Thi thử Giao thức TCP/IP và Định tuyến Router'],
            [
                'subject_id' => $netSubject->id,
                'difficulty' => 'mixed',
                'duration_minutes' => 90,
                'total_questions' => 50,
                'scoring_method' => 'equal',
                'pass_score' => 5.0,
                'max_attempts' => 2,
                'shuffle_questions' => true,
                'shuffle_options' => true,
                'status' => 'published',
                'created_by' => $lecturer->id,
            ]
        );
        ExamRevision::firstOrCreate(
            ['exam_id' => $exam3->id, 'change_note' => 'Khởi tạo bộ đề thi thử cuối kỳ môn Mạng máy tính.'],
            ['changed_by' => $lecturer->id, 'created_at' => now()->subDays(6)]
        );

        // Đề 4: Kiểm tra 15 phút từ vựng IT Unit 1-4 (Kỳ 2025)
        $exam4 = Exam::firstOrCreate(
            ['title' => 'Kiểm tra 15 phút từ vựng IT Unit 1-4 (Kỳ 2025)'],
            [
                'subject_id' => $engSubject->id,
                'difficulty' => 'easy',
                'duration_minutes' => 15,
                'total_questions' => 15,
                'scoring_method' => 'equal',
                'pass_score' => 5.0,
                'max_attempts' => 1,
                'shuffle_questions' => false,
                'shuffle_options' => true,
                'status' => 'archived',
                'created_by' => $lecturer->id,
            ]
        );
        ExamRevision::firstOrCreate(
            ['exam_id' => $exam4->id, 'change_note' => 'Đã hết kỳ học năm 2025, chuyển đề sang trạng thái Lưu trữ / Ẩn.'],
            ['changed_by' => $lecturer->id, 'created_at' => now()->subMonths(8)]
        );
    }
}
