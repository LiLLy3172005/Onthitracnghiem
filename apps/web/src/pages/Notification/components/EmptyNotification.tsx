import React from 'react';

interface EmptyNotificationProps {
  category: string;
  onResetFilter?: () => void;
}

export const EmptyNotification: React.FC<EmptyNotificationProps> = ({
  category,
  onResetFilter,
}) => {
  const getMessage = () => {
    switch (category) {
      case 'unread':
        return 'Tuyệt vời! Bạn không còn thông báo chưa đọc nào.';
      case 'exam_result':
        return 'Chưa có thông báo kết quả bài thi nào được ghi nhận.';
      case 'new_exam':
        return 'Hiện tại chưa có thông báo đề thi mới.';
      case 'admin':
        return 'Không có thông báo quản trị viên hoặc báo cáo vi phạm nào cần xử lý.';
      default:
        return 'Hòm thư thông báo của bạn hiện đang trống.';
    }
  };

  return (
    <div className="notif-empty-card">
      <div className="notif-empty-icon-wrap">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      </div>
      <h3 className="notif-empty-title">Không có thông báo nào</h3>
      <p className="notif-empty-desc">{getMessage()}</p>
      {category !== 'all' && onResetFilter && (
        <button className="notif-btn-secondary" onClick={onResetFilter}>
          Xem tất cả thông báo
        </button>
      )}
    </div>
  );
};

export default EmptyNotification;
