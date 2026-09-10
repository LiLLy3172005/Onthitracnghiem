import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicInstructorView } from './PublicInstructorView';
import { InstructorRegisterView } from './InstructorRegisterView';
import { InstructorProfileView } from './InstructorProfileView';
import { CollaboratorView } from './CollaboratorView';
import { AdminInstructorListView } from './AdminInstructorListView';
import { AdminApprovalView } from './AdminApprovalView';
import './Instructor.css';

type RoleType = 'student' | 'instructor' | 'admin';
type TabType = 'public' | 'register' | 'profile' | 'collab' | 'admin_list' | 'admin_approve';

export const InstructorDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'public';
  const initialRole = (searchParams.get('role') as RoleType) || 'student';

  const [currentRole, setCurrentRole] = useState<RoleType>(initialRole);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Đồng bộ URL params khi đổi tab
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab, role: currentRole });
  };

  const handleSwitchRole = (role: RoleType) => {
    setCurrentRole(role);
    let defaultTabForRole: TabType = 'public';
    if (role === 'student') defaultTabForRole = 'public';
    if (role === 'instructor') defaultTabForRole = 'profile';
    if (role === 'admin') defaultTabForRole = 'admin_list';

    setActiveTab(defaultTabForRole);
    setSearchParams({ tab: defaultTabForRole, role });
  };

  return (
    <div className="m2-container">
      {/* 1. Header Brain Blitz nhận diện thương hiệu chuẩn video */}
      <header className="m2-header">
        <div className="m2-header-inner">
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

          {/* Role Switcher mô phỏng 3 nhóm vai trò chính trong hệ thống */}
          <div className="m2-role-picker" title="Chuyển đổi vai trò người dùng">
            <span style={{ fontSize: '11.5px', color: '#9ca3af', fontWeight: 600, paddingLeft: '8px' }}>
              Xem theo vai trò:
            </span>
            <button
              className={`m2-role-btn ${currentRole === 'student' ? 'active' : ''}`}
              onClick={() => handleSwitchRole('student')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>Người học</span>
            </button>
            <button
              className={`m2-role-btn ${currentRole === 'instructor' ? 'active' : ''}`}
              onClick={() => handleSwitchRole('instructor')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Giảng viên</span>
            </button>
            <button
              className={`m2-role-btn ${currentRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleSwitchRole('admin')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Quản trị viên</span>
            </button>
          </div>

          <div className="m2-header-nav-links">
            <Link to="/home" className="m2-back-home-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Trang chủ
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Banner giới thiệu */}
      <section className="m2-hero-banner">
        <div className="m2-hero-inner">
          <div>
            <h1 className="m2-hero-title">
              Cổng Thông Tin & Quản Lý Giảng Viên
            </h1>
            <p className="m2-hero-subtitle">
              Hệ thống kết nối và quản lý người sáng tạo nội dung đề thi, hỗ trợ đầy đủ quy trình từ đăng ký, kiểm duyệt tính hợp lệ đến phân quyền cộng tác và tra cứu uy tín.
            </p>
          </div>

          <div className="m2-hero-stats">
            <div className="m2-stat-chip">
              <div className="m2-stat-chip-num">Toàn diện</div>
              <div className="m2-stat-chip-label">Đa vai trò</div>
            </div>
            <div className="m2-stat-chip" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <div className="m2-stat-chip-num" style={{ color: '#d97706' }}>Brain Blitz</div>
              <div className="m2-stat-chip-label" style={{ color: '#92400e' }}>Chuyên gia</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Thanh điều hướng Tabs */}
      <nav className="m2-tabs-bar">
        <div className="m2-tabs-inner">
          {/* Tab 1: Khám phá giảng viên */}
          <button
            className={`m2-tab-item ${activeTab === 'public' ? 'active' : ''}`}
            onClick={() => handleSelectTab('public')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Tra Cứu Giảng Viên Uy Tín
            <span className="m2-tab-badge">Công khai</span>
          </button>

          {/* Tab 2: Đăng ký hồ sơ */}
          <button
            className={`m2-tab-item ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleSelectTab('register')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Đăng Ký Giảng Viên Mới
          </button>

          {/* Tab 3: Sửa hồ sơ cá nhân */}
          <button
            className={`m2-tab-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleSelectTab('profile')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Hồ Sơ Chuyên Môn
          </button>

          {/* Tab 4: Phân quyền cộng tác */}
          <button
            className={`m2-tab-item ${activeTab === 'collab' ? 'active' : ''}`}
            onClick={() => handleSelectTab('collab')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Nhóm Cộng Tác Biên Soạn
          </button>

          {/* Tab 5: Quản lý danh sách */}
          <button
            className={`m2-tab-item ${activeTab === 'admin_list' ? 'active' : ''}`}
            onClick={() => handleSelectTab('admin_list')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Quản Lý Giảng Viên
          </button>

          {/* Tab 6: Phê duyệt hồ sơ */}
          <button
            className={`m2-tab-item ${activeTab === 'admin_approve' ? 'active' : ''}`}
            onClick={() => handleSelectTab('admin_approve')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Kiểm Duyệt Hồ Sơ
            <span className="m2-tab-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
              Cần thẩm định
            </span>
          </button>
        </div>
      </nav>

      {/* 4. Vùng nội dung chức năng tương ứng */}
      <main className="m2-content-area">
        {activeTab === 'public' && (
          <PublicInstructorView onRegisterClick={() => handleSelectTab('register')} />
        )}

        {activeTab === 'register' && (
          <InstructorRegisterView onSuccessRedirect={() => handleSelectTab('public')} />
        )}

        {activeTab === 'profile' && <InstructorProfileView />}

        {activeTab === 'collab' && <CollaboratorView />}

        {activeTab === 'admin_list' && <AdminInstructorListView />}

        {activeTab === 'admin_approve' && <AdminApprovalView />}
      </main>
    </div>
  );
};

export default InstructorDashboard;
