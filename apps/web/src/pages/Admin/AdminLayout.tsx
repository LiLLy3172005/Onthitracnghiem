import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>

      {/* ================= SIDEBAR ================= */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div
            className="admin-logo"
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className="admin-logo-badge">⚡</span>

            {!collapsed && (
              <span className="admin-logo-text">
                Brain Blitz
              </span>
            )}
          </div>

          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {!collapsed && (
          <div className="admin-label">
            QUẢN TRỊ HỆ THỐNG
          </div>
        )}

        <nav className="admin-navigation">

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">⌂</span>
            {!collapsed && <span>Tổng quan</span>}
          </NavLink>

          {!collapsed && (
            <div className="admin-nav-section">
              NỘI DUNG
            </div>
          )}

          <NavLink
            to="/admin/questions"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">☑</span>
            {!collapsed && <span>Kiểm duyệt câu hỏi</span>}
          </NavLink>

          <NavLink
            to="/admin/exams"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">▣</span>
            {!collapsed && <span>Kiểm duyệt đề thi</span>}
          </NavLink>

          {!collapsed && (
            <div className="admin-nav-section">
              QUẢN LÝ
            </div>
          )}

          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">⚑</span>
            {!collapsed && <span>Báo cáo vi phạm</span>}

            {!collapsed && (
              <span className="nav-badge">
                8
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/subjects"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">▤</span>
            {!collapsed && <span>Danh mục</span>}
          </NavLink>

          <NavLink
            to="/admin/activity-logs"
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">◷</span>
            {!collapsed && <span>Hoạt động hệ thống</span>}
          </NavLink>

        </nav>

        {/* Sidebar bottom */}
        <div className="admin-sidebar-bottom">

          <button
            className="admin-home-btn"
            onClick={() => navigate('/')}
          >
            <span>↗</span>
            {!collapsed && <span>Về trang chính</span>}
          </button>

          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <span>⇥</span>
            {!collapsed && <span>Đăng xuất</span>}
          </button>

        </div>

      </aside>


      {/* ================= MAIN ================= */}
      <main className="admin-main">

        <header className="admin-topbar">

          <div>
            <div className="admin-topbar-title">
              Khu vực quản trị
            </div>

            <div className="admin-breadcrumb">
              Brain Blitz
              <span>/</span>
              Admin
            </div>
          </div>

          <div className="admin-topbar-right">

            <button className="admin-notification-btn">
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="admin-profile">

              <div className="admin-avatar">
                A
              </div>

              <div className="admin-profile-info">
                <strong>Administrator</strong>
                <span>Quản trị viên</span>
              </div>

              <span className="profile-arrow">
                ▾
              </span>

            </div>

          </div>

        </header>

        <section className="admin-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
};

export default AdminLayout;