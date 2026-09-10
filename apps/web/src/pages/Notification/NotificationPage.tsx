import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { NotificationFilter } from './components/NotificationFilter';
import { NotificationItem } from './components/NotificationItem';
import { EmptyNotification } from './components/EmptyNotification';
import { NotificationDropdown } from './components/NotificationDropdown';
import { notificationApi } from './notificationApi';
import type {
  NotificationItemData,
  NotificationCategory,
  NotificationStats,
} from './types';
import './NotificationPage.css';

export const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    exam_result: 0,
    new_exam: 0,
    admin: 0,
  });
  const [category, setCategory] = useState<NotificationCategory>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationApi.getNotifications({
        category,
        search,
      });
      setNotifications(res.notifications);
      setStats(res.stats);
    } catch {
      setError('Đã xảy ra lỗi khi tải danh sách thông báo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    loadNotifications();

    const handleSync = () => {
      loadNotifications();
    };
    window.addEventListener('notification-updated', handleSync);
    return () => {
      window.removeEventListener('notification-updated', handleSync);
    };
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string | number) => {
    await notificationApi.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    loadNotifications();
  };

  const handleDelete = async (id: string | number) => {
    await notificationApi.deleteNotification(id);
    loadNotifications();
  };

  return (
    <div className="notification-shell">
      {/* Sidebar chung của hệ thống */}
      <Sidebar />

      <main className="notification-main">
        {/* Topbar */}
        <div className="notif-topbar">
          <div className="notif-topbar-left">
            <div className="notif-topbar-title">
              <h1>
                <span className="brand-accent">Brain Blitz</span> – Thông báo
              </h1>
              {stats.unread > 0 && (
                <span className="notif-unread-pill-top">
                  {stats.unread} chưa đọc
                </span>
              )}
            </div>
            <p className="notif-topbar-sub">
              Cập nhật kết quả làm bài, đề thi mới phát hành và thông báo từ ban quản trị
            </p>
          </div>

          <div className="notif-topbar-actions">
            <NotificationDropdown theme="light" />
          </div>
        </div>

        {/* Filter Toolbar */}
        <NotificationFilter
          currentCategory={category}
          searchQuery={search}
          stats={stats}
          onSelectCategory={setCategory}
          onSearchChange={setSearch}
          onMarkAllRead={handleMarkAllRead}
        />

        {/* Danh sách thông báo theo các trạng thái */}
        {loading ? (
          <div className="notif-loading-state">
            <div className="notif-spinner" />
            <p>Đang tải thông báo...</p>
          </div>
        ) : error ? (
          <div className="notif-error-state">
            <p className="notif-error-title">{error}</p>
            <button
              type="button"
              className="notif-btn-retry"
              onClick={loadNotifications}
            >
              Thử lại
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotification
            category={category}
            onResetFilter={() => {
              setCategory('all');
              setSearch('');
            }}
          />
        ) : (
          <div className="notif-list-container">
            {notifications.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationPage;
