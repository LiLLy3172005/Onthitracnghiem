import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';

interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar_url?: string;
}

export const InstructorNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    loadUserFromStorage();

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        loadUserFromStorage();
      }
    };

    window.addEventListener('user_updated', handleUserUpdate);
    window.addEventListener('storage', loadUserFromStorage);

    return () => {
      window.removeEventListener('user_updated', handleUserUpdate);
      window.removeEventListener('storage', loadUserFromStorage);
    };
  }, [location.pathname]);

  const loadUserFromStorage = () => {
    const raw = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (raw && token) {
      try {
        setCurrentUser(JSON.parse(raw));
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      navigate('/login');
    }
  };

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="m2-header">
      <div className="m2-header-inner">
        {/* Brand Logo & Back to Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/home" className="m2-logo-group">
            <div className="m2-logo-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="m2-logo-text">
              Brain <span>Blitz</span>
            </div>
          </Link>

          <Link to="/home" className="m2-back-home-btn" title="Quay lại Trang chủ chính">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Trang chủ</span>
          </Link>
        </div>

        {/* Menu Điều hướng phân đoạn hiện đại (Segmented Pill Control) */}
        <nav className="m2-role-picker">
          <Link
            to="/instructors"
            className={`m2-role-btn ${isCurrent('/instructors') ? 'active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Giảng viên uy tín</span>
          </Link>

          {/* Nếu là Học viên hoặc chưa đăng nhập: có nút đăng ký giảng viên */}
          {(!currentUser || currentUser.role === 'student') && (
            <Link
              to="/instructor-register"
              className={`m2-role-btn ${isCurrent('/instructor-register') ? 'active' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Đăng ký Giảng viên</span>
            </Link>
          )}

          {/* Nếu là Giảng viên: hiển thị Hồ sơ và Cộng tác viên */}
          {currentUser?.role === 'instructor' && (
            <>
              <Link
                to="/instructor/profile"
                className={`m2-role-btn ${isCurrent('/instructor/profile') ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Hồ sơ Giảng viên</span>
              </Link>
              <Link
                to="/instructor/collaborators"
                className={`m2-role-btn ${isCurrent('/instructor/collaborators') ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Nhóm cộng tác</span>
              </Link>
            </>
          )}

          {/* Nếu là Admin: hiển thị Quản lý và Kiểm duyệt */}
          {currentUser?.role === 'admin' && (
            <Link
              to="/admin/instructors"
              className={`m2-role-btn ${isCurrent('/admin/instructors') ? 'active' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Quản trị & Kiểm duyệt</span>
            </Link>
          )}
        </nav>

        {/* Khu vực Tài khoản người dùng thực tế */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: '#1e1e24',
                }}
              >
                {currentUser.avatar_url ? (
                  <img
                    src={resolveFileUrl(currentUser.avatar_url)}
                    alt={currentUser.full_name}
                    style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--m2-gradient)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                    }}
                  >
                    {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, lineHeight: 1.2 }}>
                    {currentUser.full_name}
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color:
                        currentUser.role === 'admin'
                          ? '#dc2626'
                          : currentUser.role === 'instructor'
                          ? '#d97706'
                          : '#059669',
                    }}
                  >
                    {currentUser.role === 'admin'
                      ? 'Admin'
                      : currentUser.role === 'instructor'
                      ? 'Giảng viên'
                      : 'Học viên'}
                  </span>
                </div>
              </Link>

              <button
                className="m2-btn m2-btn-secondary m2-btn-sm"
                onClick={handleLogout}
                style={{ color: '#6b7280' }}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="m2-btn m2-btn-secondary m2-btn-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="m2-btn m2-btn-primary m2-btn-sm">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
