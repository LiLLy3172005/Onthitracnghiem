-- =====================================================================
-- HỆ THỐNG ÔN THI TRẮC NGHIỆM - DATABASE SCHEMA (FULL COMPLETE)
-- Dựa trên: OnThiTracNghiem_Chi_tiet_Module_1.docx (12 module)
-- Engine: MySQL 8.x | Charset: utf8mb4
-- Ghi chú: Đã bổ sung đầy đủ cấu hình đề thi, xử lý câu hỏi chọn nhiều
--          đáp án, và chuẩn hóa cấu trúc cho Module 12 (AI & Gap Report).
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- MODULE 1: QUẢN LÝ NGƯỜI DÙNG (User Management)
-- ---------------------------------------------------------------------

CREATE TABLE users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    phone           VARCHAR(20)     NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    avatar_url      VARCHAR(255)    NULL,
    role            ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
    status          ENUM('active', 'locked', 'pending') NOT NULL DEFAULT 'active',
    level           VARCHAR(50)     NULL COMMENT 'Cấp độ học tập',
    email_verified_at DATETIME     NULL,
    provider        ENUM('local', 'google', 'facebook') NOT NULL DEFAULT 'local',
    provider_id     VARCHAR(255)    NULL,
    last_login_at   DATETIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME        NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE password_resets (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(150) NOT NULL,
    token       VARCHAR(255) NOT NULL,
    otp_code    VARCHAR(10)  NULL,
    expires_at  DATETIME     NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_password_resets_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- DANH MỤC HỆ THỐNG (System Categories)
-- ---------------------------------------------------------------------

CREATE TABLE subjects (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description VARCHAR(500) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='Môn học';

CREATE TABLE topics (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id  BIGINT UNSIGNED NOT NULL,
    name        VARCHAR(150) NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_topics_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Chủ đề / chương của môn học';

CREATE TABLE user_subjects_interest (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NOT NULL,
    subject_id  BIGINT UNSIGNED NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_subject (user_id, subject_id),
    CONSTRAINT fk_usi_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_usi_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Môn học quan tâm của người học';

-- ---------------------------------------------------------------------
-- MODULE 2: QUẢN LÝ GIẢNG VIÊN / NGƯỜI TẠO ĐỀ (Content Creator Management)
-- ---------------------------------------------------------------------

CREATE TABLE instructor_profiles (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
    specialization  VARCHAR(255)    NULL COMMENT 'Chuyên môn',
    bio             TEXT            NULL,
    verify_status   ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    verified_by     BIGINT UNSIGNED NULL COMMENT 'Admin đã duyệt',
    verified_at     DATETIME        NULL,
    reject_reason   VARCHAR(500)    NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_instructor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_instructor_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE instructor_subjects (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    instructor_id   BIGINT UNSIGNED NOT NULL,
    subject_id      BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_is_instructor FOREIGN KEY (instructor_id) REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_is_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Môn học phụ trách của giảng viên';

CREATE TABLE collaborators (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_instructor_id BIGINT UNSIGNED NOT NULL COMMENT 'Giảng viên chủ đề thi/nhóm',
    member_user_id  BIGINT UNSIGNED NOT NULL,
    permission      ENUM('view', 'edit', 'approve') NOT NULL DEFAULT 'edit',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collab_owner FOREIGN KEY (owner_instructor_id) REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_collab_member FOREIGN KEY (member_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Version sau: cộng tác biên soạn đề';

-- ---------------------------------------------------------------------
-- MODULE 3: QUẢN LÝ NGÂN HÀNG CÂU HỎI (Question Bank Management)
-- ---------------------------------------------------------------------

CREATE TABLE questions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id      BIGINT UNSIGNED NOT NULL,
    topic_id        BIGINT UNSIGNED NULL,
    content         TEXT            NOT NULL,
    explanation     TEXT            NULL,
    difficulty      ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
    question_type   ENUM('single_choice', 'multiple_choice') NOT NULL DEFAULT 'single_choice',
    status          ENUM('draft', 'pending_review', 'published', 'hidden') NOT NULL DEFAULT 'draft',
    created_by      BIGINT UNSIGNED NOT NULL COMMENT 'Giảng viên tạo',
    reviewed_by     BIGINT UNSIGNED NULL COMMENT 'Version sau: người duyệt',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL,
    CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_questions_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    CONSTRAINT fk_questions_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_questions_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_questions_difficulty (difficulty),
    INDEX idx_questions_status (status),
    FULLTEXT INDEX ftx_questions_content (content)
) ENGINE=InnoDB;

CREATE TABLE question_options (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL,
    content     TEXT    NOT NULL,
    is_correct  TINYINT(1) NOT NULL DEFAULT 0,
    sort_order  INT     NOT NULL DEFAULT 0,
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE question_media (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL,
    media_type  ENUM('image', 'audio', 'video', 'formula') NOT NULL,
    url         VARCHAR(500) NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_media_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE question_revisions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT UNSIGNED NOT NULL,
    changed_by  BIGINT UNSIGNED NOT NULL,
    old_content TEXT NULL,
    new_content TEXT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revision_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_revision_user FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB COMMENT='Lịch sử chỉnh sửa câu hỏi';

-- ---------------------------------------------------------------------
-- MODULE 4: QUẢN LÝ ĐỀ THI / BỘ ĐỀ (Exam & Test Set Management)
-- ---------------------------------------------------------------------

CREATE TABLE exams (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    subject_id      BIGINT UNSIGNED NOT NULL,
    topic_id        BIGINT UNSIGNED NULL,
    difficulty      ENUM('easy', 'medium', 'hard', 'mixed') NOT NULL DEFAULT 'mixed',
    duration_minutes INT            NOT NULL DEFAULT 30,
    total_questions INT             NOT NULL DEFAULT 0,
    scoring_method  ENUM('equal', 'weighted') NOT NULL DEFAULT 'equal',
    pass_score      DECIMAL(5,2)    NULL COMMENT 'Điểm tối thiểu để đạt bài thi',
    max_attempts    INT             NOT NULL DEFAULT 0 COMMENT '0: Không giới hạn lượt làm bài',
    shuffle_questions TINYINT(1)   NOT NULL DEFAULT 1 COMMENT 'Đảo câu hỏi khi làm bài',
    shuffle_options TINYINT(1)     NOT NULL DEFAULT 1 COMMENT 'Đảo đáp án khi làm bài',
    show_result_type ENUM('immediately', 'after_closed', 'no') NOT NULL DEFAULT 'immediately' COMMENT 'Thời điểm xem kết quả',
    start_time      DATETIME        NULL COMMENT 'Thời gian mở đề thi',
    end_time        DATETIME        NULL COMMENT 'Thời gian đóng đề thi',
    status          ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    is_auto_generated TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Version sau: đề ngẫu nhiên tự động',
    created_by      BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL,
    CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_exams_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    CONSTRAINT fk_exams_creator FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_exams_status (status)
) ENGINE=InnoDB;

CREATE TABLE exam_questions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_id     BIGINT UNSIGNED NOT NULL,
    question_id BIGINT UNSIGNED NOT NULL,
    points      DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    sort_order  INT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_exam_question (exam_id, question_id),
    CONSTRAINT fk_eq_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_eq_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE exam_revisions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_id     BIGINT UNSIGNED NOT NULL,
    changed_by  BIGINT UNSIGNED NOT NULL,
    change_note VARCHAR(500) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_examrev_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_examrev_user FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB COMMENT='Lịch sử chỉnh sửa đề thi';

-- ---------------------------------------------------------------------
-- MODULE 6: QUẢN LÝ LÀM BÀI & CHẤM ĐIỂM (Test Taking & Grading)
-- ---------------------------------------------------------------------

CREATE TABLE exam_attempts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exam_id         BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL,
    status          ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'in_progress',
    mode            ENUM('exam', 'practice') NOT NULL DEFAULT 'practice',
    started_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at    DATETIME NULL,
    duration_taken_seconds INT NULL,
    total_score     DECIMAL(6,2) NULL,
    correct_count   INT NULL,
    wrong_count     INT NULL,
    CONSTRAINT fk_attempts_exam FOREIGN KEY (exam_id) REFERENCES exams(id),
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_attempts_user (user_id),
    INDEX idx_attempts_status (status)
) ENGINE=InnoDB;

CREATE TABLE attempt_answers (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id          BIGINT UNSIGNED NOT NULL,
    question_id         BIGINT UNSIGNED NOT NULL,
    selected_option_id  BIGINT UNSIGNED NULL COMMENT 'Dùng cho loại câu single_choice',
    score_earned        DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Điểm đạt được cho câu hỏi này',
    is_correct          TINYINT(1) NULL,
    answered_at         DATETIME NULL,
    CONSTRAINT fk_aa_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_aa_question FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_aa_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE attempt_answer_options (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_answer_id   BIGINT UNSIGNED NOT NULL,
    selected_option_id  BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_aao_answer FOREIGN KEY (attempt_answer_id) REFERENCES attempt_answers(id) ON DELETE CASCADE,
    CONSTRAINT fk_aao_option FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Lưu danh sách đáp án chọn cho loại câu hỏi chọn nhiều (multiple_choice)';

-- ---------------------------------------------------------------------
-- MODULE 5: SỔ THEO DÕI HỌC TẬP & LỊCH SỬ LÀM BÀI (Learning Record & Test History)
-- ---------------------------------------------------------------------

CREATE TABLE learning_records (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
    total_attempts  INT NOT NULL DEFAULT 0,
    average_score   DECIMAL(6,2) NOT NULL DEFAULT 0,
    last_attempt_at DATETIME NULL,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Hồ sơ tổng hợp - cache thống kê, cập nhật sau mỗi lần nộp bài';

CREATE TABLE learning_progress_by_subject (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    subject_id      BIGINT UNSIGNED NOT NULL,
    attempts_count  INT NOT NULL DEFAULT 0,
    average_score   DECIMAL(6,2) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_user_subject_progress (user_id, subject_id),
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Version sau: thống kê biểu đồ theo môn học/chủ đề';

-- ---------------------------------------------------------------------
-- MODULE 8: THÔNG BÁO (Notification)
-- ---------------------------------------------------------------------

CREATE TABLE notifications (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NULL COMMENT 'NULL = thông báo broadcast cho tất cả',
    title       VARCHAR(255) NOT NULL,
    content     TEXT NULL,
    type        ENUM('result', 'new_exam', 'admin_alert', 'reminder', 'system') NOT NULL DEFAULT 'system',
    channel     ENUM('in_app', 'email', 'push') NOT NULL DEFAULT 'in_app',
    is_read     TINYINT(1) NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MODULE 9: ADMIN DASHBOARD & KIỂM DUYỆT
-- ---------------------------------------------------------------------

CREATE TABLE reports (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id     BIGINT UNSIGNED NOT NULL,
    target_type     ENUM('question', 'exam') NOT NULL,
    target_id       BIGINT UNSIGNED NOT NULL,
    reason          VARCHAR(500) NOT NULL,
    status          ENUM('pending', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    resolved_by     BIGINT UNSIGNED NULL,
    resolved_at     DATETIME NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_reports_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reports_status (status)
) ENGINE=InnoDB COMMENT='Báo cáo vi phạm nội dung câu hỏi/đề thi';

CREATE TABLE activity_logs (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT UNSIGNED NULL,
    action      VARCHAR(100) NOT NULL,
    description VARCHAR(500) NULL,
    ip_address  VARCHAR(45) NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_created (created_at)
) ENGINE=InnoDB COMMENT='Nhật ký hoạt động hệ thống';

-- ---------------------------------------------------------------------
-- MODULE 12 (MỞ RỘNG): AI SINH ĐỀ TỪ TÀI LIỆU & BÁO CÁO LỖ HỔNG KIẾN THỨC
-- ---------------------------------------------------------------------

CREATE TABLE documents (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL COMMENT 'Người tải lên tài liệu',
    subject_id      BIGINT UNSIGNED NULL,
    title           VARCHAR(255)    NOT NULL,
    file_path       VARCHAR(500)    NOT NULL,
    file_type       ENUM('pdf', 'docx', 'pptx') NOT NULL,
    status          ENUM('uploading', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'processing',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_docs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_docs_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Tài liệu tải lên cho AI phân tích sinh đề';

CREATE TABLE document_sections (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_id     BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(255)    NOT NULL COMMENT 'Tên chương / mục / khái niệm',
    content         TEXT            NULL,
    page_number     INT             NULL COMMENT 'Trang xuất hiện trong tài liệu',
    CONSTRAINT fk_docsec_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Các phần/chương trong tài liệu đã phân tích';

CREATE TABLE question_sources (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id         BIGINT UNSIGNED NOT NULL,
    document_id         BIGINT UNSIGNED NOT NULL,
    document_section_id BIGINT UNSIGNED NULL,
    page_number         INT             NULL COMMENT 'Vị trí trang trích xuất câu hỏi (Traceability)',
    snippet             TEXT            NULL COMMENT 'Đoạn trích tài liệu tương ứng',
    CONSTRAINT fk_qs_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_qs_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_qs_section FOREIGN KEY (document_section_id) REFERENCES document_sections(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Dẫn nguồn vị trí câu hỏi trong tài liệu gốc (Traceability)';

CREATE TABLE knowledge_gap_reports (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id          BIGINT UNSIGNED NOT NULL,
    user_id             BIGINT UNSIGNED NOT NULL,
    document_id         BIGINT UNSIGNED NULL,
    summary_report      TEXT            NULL COMMENT 'Tóm tắt các lỗ hổng kiến thức',
    report_pdf_url      VARCHAR(500)    NULL COMMENT 'Đường dẫn file PDF xuất ra',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_kgr_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_kgr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_kgr_doc FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Báo cáo lỗ hổng kiến thức sau mỗi lượt làm bài';

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- GHI CHÚ TRIỂN KHAI HOÀN THIỆN
-- =====================================================================
-- 1. Bảng "personal_access_tokens" (cho JWT/Sanctum) sẽ được Laravel
--    tự sinh qua lệnh: php artisan install:api  hoặc  sanctum:install
-- 2. Redis KHÔNG có bảng SQL - dùng để cache kết quả tìm kiếm/lọc,
--    danh sách đề thi phổ biến (Module 7, 10).
-- 3. Đã hoàn thiện toàn bộ cấu hình bài thi (Module 4), câu hỏi chọn
--    nhiều đáp án (Module 6) và chuẩn bị sẵn cấu trúc cho AI (Module 12).
-- 4. Trước khi chạy:
--       CREATE DATABASE onthitracnghiem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
--    rồi chạy: mysql -u root -p onthitracnghiem < schema.sql
-- =====================================================================