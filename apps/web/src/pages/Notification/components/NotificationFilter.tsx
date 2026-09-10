import React from 'react';
import type { NotificationCategory, NotificationStats } from '../types';

interface NotificationFilterProps {
  currentCategory: NotificationCategory;
  searchQuery: string;
  stats: NotificationStats;
  onSelectCategory: (category: NotificationCategory) => void;
  onSearchChange: (query: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationFilter: React.FC<NotificationFilterProps> = ({
  currentCategory,
  searchQuery,
  stats,
  onSelectCategory,
  onSearchChange,
  onMarkAllRead,
}) => {
  const tabs: { id: NotificationCategory; label: string; count?: number; badgeType?: string }[] = [
    { id: 'all', label: 'Tất cả', count: stats.total },
    {
      id: 'unread',
      label: 'Chưa đọc',
      count: stats.unread,
      badgeType: stats.unread > 0 ? 'unread-count' : undefined,
    },
    { id: 'exam_result', label: 'Kết quả bài thi', count: stats.exam_result },
    { id: 'new_exam', label: 'Đề thi mới', count: stats.new_exam },
    { id: 'admin', label: 'Hệ thống & Admin', count: stats.admin },
  ];

  return (
    <div className="notif-filter-wrapper">
      <div className="notif-tabs-row">
        <div className="notif-tabs-list">
          {tabs.map((tab) => {
            const isActive = currentCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`notif-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelectCategory(tab.id)}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`notif-tab-badge ${
                      tab.badgeType === 'unread-count' ? 'is-unread-alert' : ''
                    } ${isActive ? 'is-badge-active' : ''}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="notif-actions-right">
          {stats.unread > 0 && (
            <button
              type="button"
              className="notif-btn-mark-all"
              onClick={onMarkAllRead}
              title="Đánh dấu tất cả thông báo là đã đọc"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>
      </div>

      <div className="notif-search-bar">
        <div className="notif-search-input-wrap">
          <svg className="notif-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="notif-search-input"
            placeholder="Tìm kiếm thông báo theo tiêu đề, môn học, nội dung..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="notif-search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationFilter;
