import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItemData } from '../types';

interface NotificationItemProps {
  item: NotificationItemData;
  onMarkAsRead: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onActionClick?: (item: NotificationItemData) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  onMarkAsRead,
  onDelete,
  onActionClick,
}) => {
  const navigate = useNavigate();
  const isUnread = !item.read_at;

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return item.created_at;
    }
  };

  const handleAction = () => {
    if (isUnread) {
      onMarkAsRead(item.id);
    }

    if (onActionClick) {
      onActionClick(item);
      return;
    }

    if (item.action_url) {
      navigate(item.action_url);
    }
  };

  // Render Icon theo từng loại thông báo
  const renderIcon = () => {
    switch (item.type) {
      case 'exam_result':
        return (
          <div className="notif-item-icon-circle is-exam-result">
            {/* Icon Check / Score */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        );

      case 'new_exam':
        return (
          <div className="notif-item-icon-circle is-new-exam">
            {/* Icon Document / File */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
        );

      case 'admin_report_violation':
        return (
          <div className="notif-item-icon-circle is-admin-report">
            {/* Icon Shield Alert */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );

      case 'admin_teacher_pending':
        return (
          <div className="notif-item-icon-circle is-admin-teacher">
            {/* Icon User Plus / Shield */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
        );

      case 'system':
      default:
        return (
          <div className="notif-item-icon-circle is-system">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className={`notif-item-card ${isUnread ? 'is-unread' : 'is-read'} type-${item.type}`}
    >
      {/* Unread indicator dot */}
      {isUnread && <span className="notif-unread-dot" title="Chưa đọc" />}

      {/* Icon */}
      <div className="notif-item-icon-col">{renderIcon()}</div>

      {/* Content Column */}
      <div className="notif-item-body">
        <div className="notif-item-header-row">
          <h4 className="notif-item-title" onClick={handleAction}>
            {item.title}
          </h4>
          <span className="notif-item-time">{formatRelativeTime(item.created_at)}</span>
        </div>

        <p className="notif-item-content">{item.content}</p>

        {/* 1. Chi tiết Thông báo Kết quả làm bài */}
        {item.type === 'exam_result' && item.exam_result && (
          <div className="notif-payload-box is-result-box">
            <div className="notif-payload-meta">
              <span className="notif-tag notif-tag-subject">
                📚 {item.exam_result.subject_name}
              </span>
              <span className="notif-tag notif-tag-exam">
                📝 {item.exam_result.exam_title}
              </span>
            </div>
            <div className="notif-score-badge">
              <span className="notif-score-label">Điểm số:</span>
              <span className="notif-score-value">
                {item.exam_result.score} / {item.exam_result.max_score}
              </span>
              <span className={`notif-score-status ${item.exam_result.passed ? 'is-passed' : 'is-failed'}`}>
                {item.exam_result.passed ? '✓ Đạt' : '✗ Chưa đạt'}
              </span>
            </div>
          </div>
        )}

        {/* 2. Chi tiết Thông báo Đề thi mới */}
        {item.type === 'new_exam' && item.new_exam && (
          <div className="notif-payload-box is-exam-box">
            <div className="notif-payload-meta">
              <span className="notif-tag notif-tag-subject">
                🏷️ {item.new_exam.subject_name}
              </span>
              <span className="notif-tag notif-tag-info">
                ⏱ {item.new_exam.duration_minutes} phút • {item.new_exam.total_questions} câu hỏi
              </span>
            </div>
            {item.new_exam.deadline && (
              <div className="notif-deadline-info">
                <span className="deadline-icon">⏳</span>
                <span className="deadline-label">Hạn làm bài:</span>
                <span className="deadline-value">{item.new_exam.deadline}</span>
              </div>
            )}
          </div>
        )}

        {/* 3. Chi tiết Thông báo Admin (Giảng viên / Báo cáo) */}
        {(item.type === 'admin_report_violation' || item.type === 'admin_teacher_pending') &&
          item.admin_action && (
            <div className="notif-payload-box is-admin-box">
              <div className="notif-admin-header">
                <span
                  className={`notif-admin-severity ${
                    item.admin_action.severity === 'urgent' ? 'is-urgent' : 'is-normal'
                  }`}
                >
                  {item.admin_action.severity === 'urgent' ? '🚨 Cần xử lý gấp' : '📋 Chờ duyệt hồ sơ'}
                </span>
                <span className="notif-target-name">{item.admin_action.target_name}</span>
              </div>
              <div className="notif-admin-desc">{item.admin_action.description}</div>
            </div>
          )}

        {/* Footer Actions Row */}
        <div className="notif-item-footer">
          <div className="notif-footer-status">
            <span className={`notif-status-pill ${isUnread ? 'is-unread-pill' : 'is-read-pill'}`}>
              {isUnread ? 'Chưa đọc' : 'Đã đọc'}
            </span>
          </div>

          <div className="notif-footer-buttons">
            {isUnread && (
              <button
                type="button"
                className="notif-action-btn btn-mark-read"
                onClick={() => onMarkAsRead(item.id)}
                title="Đánh dấu đã đọc"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Đã đọc</span>
              </button>
            )}

            {item.action_label && (
              <button
                type="button"
                className="notif-action-btn btn-cta"
                onClick={handleAction}
              >
                {item.action_label}
                <span className="btn-arrow">➔</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="notif-action-btn btn-delete"
                onClick={() => onDelete(item.id)}
                title="Xóa thông báo này"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
