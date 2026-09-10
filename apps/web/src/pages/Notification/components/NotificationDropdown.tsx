import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../notificationApi';
import type { NotificationItemData } from '../types';

interface NotificationDropdownProps {
  theme?: 'dark' | 'light'; // dark for landing navbar, light for page topbars
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  theme = 'dark',
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [recentList, setRecentList] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadDropdownData = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications({ category: 'all' });
      setUnreadCount(res.stats.unread);
      // Lấy 5 thông báo mới nhất
      setRecentList(res.notifications.slice(0, 5));
    } catch {
      // fallback handled in api
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdownData();

    // Lắng nghe sự kiện đồng bộ khi có thông báo được đọc hoặc cập nhật
    const handleUpdate = () => {
      loadDropdownData();
    };

    window.addEventListener('notification-updated', handleUpdate);
    return () => {
      window.removeEventListener('notification-updated', handleUpdate);
    };
  }, []);

  // Xử lý đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      loadDropdownData();
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = async (item: NotificationItemData) => {
    if (!item.read_at) {
      await notificationApi.markAsRead(item.id);
    }
    setIsOpen(false);
    if (item.action_url) {
      navigate(item.action_url);
    } else {
      navigate('/notifications');
    }
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    loadDropdownData();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  // Helper render relative time
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const minutes = Math.floor(diffMs / 60000);
      if (minutes < 1) return 'Vừa xong';
      if (minutes < 60) return `${minutes}p trước`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h trước`;
      return `${Math.floor(hours / 24)} ngày trước`;
    } catch {
      return '';
    }
  };

  // Icon type badge nhỏ
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'exam_result':
        return '🎯';
      case 'new_exam':
        return '📝';
      case 'admin_report_violation':
        return '🚨';
      case 'admin_teacher_pending':
        return '🎓';
      default:
        return '⚡';
    }
  };

  return (
    <div className={`notif-bell-container theme-${theme}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        className={`notif-bell-btn ${isOpen ? 'is-active' : ''}`}
        onClick={toggleDropdown}
        aria-label="Thông báo"
        title="Thông báo"
      >
        <svg
          className="notif-bell-svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notif-bell-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="notif-dropdown-menu">
          <div className="notif-dropdown-header">
            <div className="notif-dropdown-header-title">
              <span className="title-text">Thông báo</span>
              {unreadCount > 0 && (
                <span className="unread-tag">{unreadCount} mới</span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-text-action"
                onClick={handleMarkAllRead}
              >
                Đã đọc tất cả
              </button>
            )}
          </div>

          <div className="notif-dropdown-body">
            {loading && recentList.length === 0 ? (
              <div className="notif-dropdown-loading">Đang tải thông báo...</div>
            ) : recentList.length === 0 ? (
              <div className="notif-dropdown-empty">
                <span className="empty-emoji">🔔</span>
                <p>Không có thông báo mới nào</p>
              </div>
            ) : (
              <div className="notif-dropdown-list">
                {recentList.map((item) => {
                  const isUnread = !item.read_at;
                  return (
                    <div
                      key={item.id}
                      className={`notif-dropdown-item ${isUnread ? 'is-unread' : 'is-read'}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="dropdown-item-icon">
                        {getBadgeIcon(item.type)}
                      </div>
                      <div className="dropdown-item-info">
                        <div className="dropdown-item-title-row">
                          <span className="dropdown-item-title">{item.title}</span>
                          <span className="dropdown-item-time">
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>
                        <p className="dropdown-item-desc">{item.content}</p>

                        {/* Badges nhỏ tiện ích */}
                        {item.type === 'exam_result' && item.exam_result && (
                          <div className="dropdown-mini-meta">
                            <span className="mini-score">
                              Điểm: <strong>{item.exam_result.score}/10</strong>
                            </span>
                            <span className="mini-sub">{item.exam_result.subject_name}</span>
                          </div>
                        )}
                        {item.type === 'new_exam' && item.new_exam && (
                          <div className="dropdown-mini-meta">
                            <span className="mini-sub">{item.new_exam.subject_name}</span>
                            <span className="mini-time">{item.new_exam.duration_minutes} phút</span>
                          </div>
                        )}
                      </div>
                      {isUnread && <span className="dropdown-unread-dot" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="notif-dropdown-footer">
            <button
              type="button"
              className="btn-view-all-notifs"
              onClick={handleViewAll}
            >
              Xem tất cả thông báo ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
