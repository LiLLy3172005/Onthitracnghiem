import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  {
    to: '/home',
    label: 'Trang chủ',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/subjects',
    label: 'Môn học',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    to: '/exams',
    label: 'Đề thi',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'Lịch sử',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    to: '/notifications',
    label: 'Thông báo',
    isNotification: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Hồ sơ',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC = () => {
  const [unreadCount, setUnreadCount] = React.useState<number>(0);

  React.useEffect(() => {
    // Đọc unread count từ localStorage / api
    const loadUnread = () => {
      try {
        const raw = localStorage.getItem('bb_notifications_data_v1');
        if (raw) {
          const list = JSON.parse(raw);
          const count = list.filter((item: any) => !item.read_at).length;
          setUnreadCount(count);
        }
      } catch {}
    };

    loadUnread();
    window.addEventListener('notification-updated', loadUnread);
    return () => window.removeEventListener('notification-updated', loadUnread);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg className="logo-symbol" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span>Brain Blitz</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' is-active' : '')}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.isNotification && unreadCount > 0 && (
              <span
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;