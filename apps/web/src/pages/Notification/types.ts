export type NotificationType =
  | 'exam_result'              // Thông báo kết quả làm bài
  | 'new_exam'                // Thông báo đề thi mới
  | 'admin_teacher_pending'   // Admin: Có giảng viên mới chờ duyệt
  | 'admin_report_violation'  // Admin: Có báo cáo vi phạm cần xử lý
  | 'system';                 // Thông báo hệ thống

export type NotificationCategory =
  | 'all'
  | 'unread'
  | 'exam_result'
  | 'new_exam'
  | 'admin';

export interface ExamResultData {
  exam_id: number;
  exam_title: string;
  subject_name: string;
  score: number;
  max_score: number;
  passed: boolean;
  attempt_id?: number;
  completed_at?: string;
}

export interface NewExamData {
  exam_id: number;
  exam_title: string;
  subject_name: string;
  duration_minutes: number;
  total_questions: number;
  deadline?: string;
  created_at_label?: string;
}

export interface AdminActionData {
  action_type: 'teacher_pending' | 'report_violation';
  target_id: number;
  target_name: string;
  description: string;
  severity?: 'normal' | 'urgent';
}

export interface NotificationItemData {
  id: string | number;
  type: NotificationType;
  title: string;
  content: string;
  created_at: string;
  read_at: string | null;
  // Specific payload by type
  exam_result?: ExamResultData;
  new_exam?: NewExamData;
  admin_action?: AdminActionData;
  // Generic action CTA
  action_label?: string;
  action_url?: string;
}

export interface NotificationFilter {
  category: NotificationCategory;
  search?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  exam_result: number;
  new_exam: number;
  admin: number;
}
