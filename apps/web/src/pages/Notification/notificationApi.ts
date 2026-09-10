import { api } from '@onthitracnghiem/shared';
import type {
  NotificationItemData,
  NotificationFilter,
  NotificationStats,
} from './types';

const STORAGE_KEY = 'bb_notifications_data_v1';

const initialNotifications: NotificationItemData[] = [
  {
    id: 'notif-1',
    type: 'exam_result',
    title: 'Kết quả làm bài: Đề tổng hợp - Giải tích & Tích phân',
    content: 'Bạn đã hoàn thành bài thi với kết quả xuất sắc! Chúc mừng bạn đã vượt qua mục tiêu điểm số môn Toán.',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 phút trước
    read_at: null, // Chưa đọc
    exam_result: {
      exam_id: 101,
      exam_title: 'Đề tổng hợp - Giải tích & Tích phân',
      subject_name: 'Toán học',
      score: 9.0,
      max_score: 10.0,
      passed: true,
      attempt_id: 8841,
      completed_at: '15 phút trước',
    },
    action_label: 'Xem kết quả',
    action_url: '/exams',
  },
  {
    id: 'notif-2',
    type: 'new_exam',
    title: 'Đề thi mới: Khảo sát kiến thức React 19 & TypeScript',
    content: 'Giảng viên Bộ môn Web vừa phát hành đề thi mới dành cho lớp chuyên đề Lập trình Frontend hiện đại.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
    read_at: null, // Chưa đọc
    new_exam: {
      exam_id: 204,
      exam_title: 'Khảo sát kiến thức React 19 & TypeScript',
      subject_name: 'Lập trình Web',
      duration_minutes: 60,
      total_questions: 40,
      deadline: '20.09.2026 • 23:59',
      created_at_label: 'Hôm nay lúc 08:30',
    },
    action_label: 'Làm bài ngay',
    action_url: '/exams',
  },
  {
    id: 'notif-3',
    type: 'admin_report_violation',
    title: '[Admin] Báo cáo vi phạm câu hỏi thi cần xử lý',
    content: 'Học viên vừa gửi phản hồi về câu hỏi #4920 trong đề thi "Mạng máy tính - Mô hình OSI". Cần thẩm tra nội dung.',
    created_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 giờ trước
    read_at: null, // Chưa đọc
    admin_action: {
      action_type: 'report_violation',
      target_id: 4920,
      target_name: 'Câu hỏi #4920 (Mạng máy tính)',
      description: 'Nội dung câu hỏi bị sai đáp án D theo chuẩn RFC mới.',
      severity: 'urgent',
    },
    action_label: 'Xử lý báo cáo',
    action_url: '/exams',
  },
  {
    id: 'notif-4',
    type: 'exam_result',
    title: 'Kết quả làm bài: Ngữ pháp trọng tâm B2 - 12 Thì Tiếng Anh',
    content: 'Bạn đã hoàn thành bài luyện tập ngữ pháp. Hãy xem lại phần giải thích chi tiết các câu chưa chính xác.',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 giờ trước
    read_at: '2026-09-10T02:00:00Z', // Đã đọc
    exam_result: {
      exam_id: 103,
      exam_title: 'Ngữ pháp trọng tâm B2 - 12 Thì Tiếng Anh',
      subject_name: 'Tiếng Anh',
      score: 8.5,
      max_score: 10.0,
      passed: true,
      attempt_id: 8830,
      completed_at: 'Sáng nay',
    },
    action_label: 'Xem kết quả',
    action_url: '/exams',
  },
  {
    id: 'notif-5',
    type: 'admin_teacher_pending',
    title: '[Admin] Có giảng viên mới chờ duyệt hồ sơ',
    content: 'ThS. Đặng Tuấn Kiệt vừa nộp chứng chỉ sư phạm và đăng ký mở lớp ôn thi môn Hóa học THPT Quốc gia.',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
    read_at: null, // Chưa đọc
    admin_action: {
      action_type: 'teacher_pending',
      target_id: 512,
      target_name: 'ThS. Đặng Tuấn Kiệt (Hóa học)',
      description: 'Hồ sơ chờ phê duyệt phân quyền Giảng viên tạo đề.',
      severity: 'normal',
    },
    action_label: 'Xử lý hồ sơ',
    action_url: '/profile',
  },
  {
    id: 'notif-6',
    type: 'new_exam',
    title: 'Đề thi mới: Cơ học & Dao động điều hòa 2026',
    content: 'Đề thi thử môn Vật lý chuẩn ma trận tốt nghiệp THPT vừa được xuất bản với 40 câu trắc nghiệm.',
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 ngày trước
    read_at: '2026-09-09T08:00:00Z', // Đã đọc
    new_exam: {
      exam_id: 105,
      exam_title: 'Cơ học & Dao động điều hòa 2026',
      subject_name: 'Vật lý',
      duration_minutes: 50,
      total_questions: 40,
      deadline: '15.09.2026 • 20:00',
      created_at_label: 'Hôm qua',
    },
    action_label: 'Làm bài ngay',
    action_url: '/exams',
  },
  {
    id: 'notif-7',
    type: 'system',
    title: 'Thông báo nâng cấp hệ thống máy chủ Brain Blitz',
    content: 'Hệ thống sẽ bảo trì định kỳ từ 00:00 đến 02:00 sáng ngày 12/09/2026 để nâng cấp cụm AI chấm điểm.',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 ngày trước
    read_at: '2026-09-08T10:00:00Z', // Đã đọc
    action_label: 'Chi tiết lịch bảo trì',
    action_url: '/home',
  },
];

function getStoredNotifications(): NotificationItemData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifications));
      return initialNotifications;
    }
    return JSON.parse(raw);
  } catch {
    return initialNotifications;
  }
}

function saveNotifications(data: NotificationItemData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Phát event để navbar chuông và page đồng bộ ngay
    window.dispatchEvent(new CustomEvent('notification-updated'));
  } catch {}
}

export const notificationApi = {
  /**
   * Lấy danh sách thông báo và số lượng thống kê
   */
  async getNotifications(filter: NotificationFilter = { category: 'all' }): Promise<{
    notifications: NotificationItemData[];
    stats: NotificationStats;
  }> {
    // 1. Thử gọi backend API trước
    try {
      const res = await api.get('/notifications', { params: filter });
      if (res.data?.success && res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Fallback xuống Local Mock Data khi backend chưa có API
    }

    // 2. Mock Data Logic
    const all = getStoredNotifications();

    let filtered = [...all];

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.exam_result && n.exam_result.subject_name.toLowerCase().includes(q)) ||
          (n.new_exam && n.new_exam.subject_name.toLowerCase().includes(q))
      );
    }

    switch (filter.category) {
      case 'unread':
        filtered = filtered.filter((n) => !n.read_at);
        break;
      case 'exam_result':
        filtered = filtered.filter((n) => n.type === 'exam_result');
        break;
      case 'new_exam':
        filtered = filtered.filter((n) => n.type === 'new_exam');
        break;
      case 'admin':
        filtered = filtered.filter(
          (n) => n.type === 'admin_teacher_pending' || n.type === 'admin_report_violation' || n.type === 'system'
        );
        break;
      default:
        break;
    }

    const stats: NotificationStats = {
      total: all.length,
      unread: all.filter((n) => !n.read_at).length,
      exam_result: all.filter((n) => n.type === 'exam_result').length,
      new_exam: all.filter((n) => n.type === 'new_exam').length,
      admin: all.filter(
        (n) => n.type === 'admin_teacher_pending' || n.type === 'admin_report_violation' || n.type === 'system'
      ).length,
    };

    return {
      notifications: filtered,
      stats,
    };
  },

  /**
   * Lấy số lượng thông báo chưa đọc nhanh (cho badge chuông)
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await api.get('/notifications/unread-count');
      if (typeof res.data?.unread_count === 'number') {
        return res.data.unread_count;
      }
    } catch {}

    const all = getStoredNotifications();
    return all.filter((n) => !n.read_at).length;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  async markAsRead(id: string | number): Promise<void> {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {}

    const all = getStoredNotifications();
    const updated = all.map((n) =>
      String(n.id) === String(id) && !n.read_at
        ? { ...n, read_at: new Date().toISOString() }
        : n
    );
    saveNotifications(updated);
  },

  /**
   * Đánh dấu TẤT CẢ thông báo đã đọc
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.post('/notifications/mark-all-read');
    } catch {}

    const all = getStoredNotifications();
    const now = new Date().toISOString();
    const updated = all.map((n) => (n.read_at ? n : { ...n, read_at: now }));
    saveNotifications(updated);
  },

  /**
   * Xóa thông báo
   */
  async deleteNotification(id: string | number): Promise<void> {
    try {
      await api.delete(`/notifications/${id}`);
    } catch {}

    const all = getStoredNotifications();
    const updated = all.filter((n) => String(n.id) !== String(id));
    saveNotifications(updated);
  },
};
