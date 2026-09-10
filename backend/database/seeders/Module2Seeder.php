<?php

namespace Database\Seeders;

use App\Models\Collaborator;
use App\Models\InstructorProfile;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class Module2Seeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo 10 môn học chuẩn
        $subjectsData = [
            ['name' => 'Toán học', 'description' => 'Đại số, Hình học, Giải tích và Lượng giác THPT & Đại học'],
            ['name' => 'Vật lý', 'description' => 'Cơ học, Dao động điều hòa, Sóng cơ, Điện xoay chiều, Quang hình'],
            ['name' => 'Hóa học', 'description' => 'Hóa vô cơ, Hóa hữu cơ, Phản ứng oxi hóa khử và Điện phân'],
            ['name' => 'Sinh học', 'description' => 'Di truyền học, Tiến hóa, Sinh thái học và Tế bào học'],
            ['name' => 'Tiếng Anh', 'description' => 'Ngữ pháp, Từ vựng, Đọc hiểu, Ngữ âm và Luyện thi chứng chỉ quốc tế'],
            ['name' => 'Tin học', 'description' => 'Thuật toán, Cấu trúc dữ liệu, Lập trình Python, C++, Web cơ bản'],
            ['name' => 'Ngữ văn', 'description' => 'Đọc hiểu văn bản, Nghị luận xã hội và Nghị luận văn học'],
            ['name' => 'Lịch sử', 'description' => 'Lịch sử Việt Nam hiện đại, Lịch sử thế giới thời kỳ cận - hiện đại'],
            ['name' => 'Địa lý', 'description' => 'Địa lý tự nhiên, Địa lý kinh tế - xã hội Việt Nam và Thế giới'],
            ['name' => 'Giáo dục công dân', 'description' => 'Pháp luật và Đời sống, Công dân với kinh tế và xã hội'],
        ];

        $subjectModels = [];
        foreach ($subjectsData as $s) {
            $subjectModels[$s['name']] = Subject::firstOrCreate(['name' => $s['name']], $s);
        }

        // 2. Tạo Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@brainblitz.vn'],
            [
                'full_name'  => 'Ban Quản Trị Brain Blitz',
                'password'   => Hash::make('123456'),
                'role'       => 'admin',
                'status'     => 'active',
                'phone'      => '0901234567',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            ]
        );

        // 3. Giảng viên 1: Thầy Nguyễn Văn An (Approved - Toán, Tin)
        $user1 = User::firstOrCreate(
            ['email' => 'gv_toan@brainblitz.vn'],
            [
                'full_name'  => 'ThS. Nguyễn Văn An',
                'password'   => Hash::make('123456'),
                'role'       => 'instructor',
                'status'     => 'active',
                'phone'      => '0912345678',
                'avatar_url' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            ]
        );
        $profile1 = InstructorProfile::updateOrCreate(
            ['user_id' => $user1->id],
            [
                'specialization' => 'Chuyên gia Luyện thi Toán THPTQG & ĐGNL ĐHQG',
                'bio'            => '12 năm kinh nghiệm giảng dạy và biên soạn ngân hàng câu hỏi trắc nghiệm Toán học chuẩn Bộ GD&ĐT. Tác giả 3 đầu sách chuyên đề Hàm số & Hình học không gian.',
                'verify_status'  => 'approved',
                'verified_by'    => $admin->id,
                'verified_at'    => now()->subDays(5),
            ]
        );
        $profile1->subjects()->sync([
            $subjectModels['Toán học']->id,
            $subjectModels['Tin học']->id,
        ]);

        // 4. Giảng viên 2: Cô Trần Thị Bích (Approved - Tiếng Anh)
        $user2 = User::firstOrCreate(
            ['email' => 'gv_anh@brainblitz.vn'],
            [
                'full_name'  => 'ThS. Trần Thị Bích',
                'password'   => Hash::make('123456'),
                'role'       => 'instructor',
                'status'     => 'active',
                'phone'      => '0923456789',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
            ]
        );
        $profile2 = InstructorProfile::updateOrCreate(
            ['user_id' => $user2->id],
            [
                'specialization' => 'Thạc sĩ Ngôn ngữ Anh - IELTS 8.5, Chuyên gia Luyện đề THPT',
                'bio'            => 'Giảng viên khoa Ngoại ngữ với hơn 8 năm dẫn dắt học sinh đạt điểm 9+ môn Tiếng Anh. Chuyên gia xây dựng đề thi mô phỏng đề thi chính thức bám sát ma trận.',
                'verify_status'  => 'approved',
                'verified_by'    => $admin->id,
                'verified_at'    => now()->subDays(3),
            ]
        );
        $profile2->subjects()->sync([
            $subjectModels['Tiếng Anh']->id,
        ]);

        // 5. Giảng viên 3: Thầy Lê Quang Cường (Approved - Vật lý)
        $user3 = User::firstOrCreate(
            ['email' => 'gv_ly@brainblitz.vn'],
            [
                'full_name'  => 'TS. Lê Quang Cường',
                'password'   => Hash::make('123456'),
                'role'       => 'instructor',
                'status'     => 'active',
                'phone'      => '0934567890',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            ]
        );
        $profile3 = InstructorProfile::updateOrCreate(
            ['user_id' => $user3->id],
            [
                'specialization' => 'Tiến sĩ Vật lý - Chuyên gia Bồi dưỡng Học sinh Giỏi & Luyện thi',
                'bio'            => 'Kinh nghiệm luyện thi chuyên sâu các chủ đề Dao động, Sóng và Lượng tử ánh sáng. Ứng dụng phương pháp giải nhanh trắc nghiệm vật lý bằng máy tính bỏ túi.',
                'verify_status'  => 'approved',
                'verified_by'    => $admin->id,
                'verified_at'    => now()->subDays(1),
            ]
        );
        $profile3->subjects()->sync([
            $subjectModels['Vật lý']->id,
        ]);

        // 6. Giảng viên chờ duyệt (Pending 1): Cô Phạm Thị Dung (Hóa học)
        $user4 = User::firstOrCreate(
            ['email' => 'gv_pending_hoa@brainblitz.vn'],
            [
                'full_name'  => 'Cô Phạm Thị Dung',
                'password'   => Hash::make('123456'),
                'role'       => 'student', // Đang chờ duyệt nên role vẫn là student
                'status'     => 'active',
                'phone'      => '0945678901',
                'avatar_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            ]
        );
        $profile4 = InstructorProfile::updateOrCreate(
            ['user_id' => $user4->id],
            [
                'specialization' => 'Cử nhân Sư phạm Hóa học - Chuyên đề Hóa Hữu cơ 12',
                'bio'            => 'Giáo viên trường THPT Chuyên, có nhu cầu đăng ký để biên soạn ngân hàng 500 câu hỏi trắc nghiệm chương Este - Lipit và Peptit phục vụ ôn thi.',
                'verify_status'  => 'pending',
            ]
        );
        $profile4->subjects()->sync([
            $subjectModels['Hóa học']->id,
        ]);

        // 7. Giảng viên chờ duyệt (Pending 2): Thầy Hoàng Văn Em (Sinh học)
        $user5 = User::firstOrCreate(
            ['email' => 'gv_pending_sinh@brainblitz.vn'],
            [
                'full_name'  => 'Thầy Hoàng Văn Em',
                'password'   => Hash::make('123456'),
                'role'       => 'student',
                'status'     => 'active',
                'phone'      => '0956789012',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            ]
        );
        $profile5 = InstructorProfile::updateOrCreate(
            ['user_id' => $user5->id],
            [
                'specialization' => 'Thạc sĩ Di truyền học - Đại học Khoa học Tự nhiên',
                'bio'            => 'Mong muốn đóng góp bộ câu hỏi phân hóa cao về quy luật di truyền Men-đen và tương tác gen cho hệ thống.',
                'verify_status'  => 'pending',
            ]
        );
        $profile5->subjects()->sync([
            $subjectModels['Sinh học']->id,
        ]);

        // 8. Giảng viên bị từ chối (Rejected): Thầy Vũ Minh Phúc (Lịch sử)
        $user6 = User::firstOrCreate(
            ['email' => 'gv_rejected_su@brainblitz.vn'],
            [
                'full_name'  => 'Thầy Vũ Minh Phúc',
                'password'   => Hash::make('123456'),
                'role'       => 'student',
                'status'     => 'active',
                'phone'      => '0967890123',
                'avatar_url' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
            ]
        );
        $profile6 = InstructorProfile::updateOrCreate(
            ['user_id' => $user6->id],
            [
                'specialization' => 'Cử nhân Lịch sử',
                'bio'            => 'Đam mê sưu tầm đề thi lịch sử trắc nghiệm.',
                'verify_status'  => 'rejected',
                'verified_by'    => $admin->id,
                'verified_at'    => now()->subDays(2),
                'reject_reason'  => 'Hồ sơ chưa cung cấp bằng cấp sư phạm hoặc chứng chỉ chuyên ngành hợp lệ theo yêu cầu của hệ thống kiểm duyệt Brain Blitz.',
            ]
        );
        $profile6->subjects()->sync([
            $subjectModels['Lịch sử']->id,
        ]);

        // 9. Giảng viên bị khóa tài khoản (Locked): Thầy Đặng Quang Huy (Địa lý)
        $user7 = User::firstOrCreate(
            ['email' => 'gv_locked_dia@brainblitz.vn'],
            [
                'full_name'  => 'Thầy Đặng Quang Huy',
                'password'   => Hash::make('123456'),
                'role'       => 'instructor',
                'status'     => 'locked', // Bị khóa
                'phone'      => '0978901234',
                'avatar_url' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
            ]
        );
        $profile7 = InstructorProfile::updateOrCreate(
            ['user_id' => $user7->id],
            [
                'specialization' => 'Giáo viên Địa lý THPT',
                'bio'            => 'Tạm dừng hoạt động để xác minh phản ánh về bản quyền câu hỏi.',
                'verify_status'  => 'approved',
                'verified_by'    => $admin->id,
                'verified_at'    => now()->subMonths(1),
            ]
        );
        $profile7->subjects()->sync([
            $subjectModels['Địa lý']->id,
        ]);

        // 10. Thành viên / Học viên mẫu
        $student1 = User::firstOrCreate(
            ['email' => 'lan.nguyen@brainblitz.vn'],
            [
                'full_name'  => 'Nguyễn Hương Lan',
                'password'   => Hash::make('123456'),
                'role'       => 'student',
                'status'     => 'active',
                'phone'      => '0989012345',
            ]
        );
        $student2 = User::firstOrCreate(
            ['email' => 'nam.hoang@brainblitz.vn'],
            [
                'full_name'  => 'Hoàng Văn Nam',
                'password'   => Hash::make('123456'),
                'role'       => 'student',
                'status'     => 'active',
                'phone'      => '0990123456',
            ]
        );

        // 11. Cộng tác viên cho Thầy Nguyễn Văn An
        Collaborator::updateOrCreate(
            [
                'owner_instructor_id' => $profile1->id,
                'member_user_id'      => $student1->id,
            ],
            [
                'permission' => 'edit', // Quyền biên soạn đề
                'created_at' => now()->subDays(4),
            ]
        );

        Collaborator::updateOrCreate(
            [
                'owner_instructor_id' => $profile1->id,
                'member_user_id'      => $student2->id,
            ],
            [
                'permission' => 'view', // Chỉ xem trước đề
                'created_at' => now()->subDays(2),
            ]
        );
    }
}
