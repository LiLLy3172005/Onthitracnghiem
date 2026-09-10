import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstructorNav } from './InstructorNav';
import { AdminInstructorListView } from './AdminInstructorListView';
import { AdminApprovalView } from './AdminApprovalView';
import './Instructor.css';

export const AdminInstructorPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'list' | 'approve'>('list');

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  // RBAC Guard: Chỉ tài khoản Admin mới được xem trang này
  if (!user || user.role !== 'admin') {
    return (
      <div className="m2-container">
        <InstructorNav />
        <main className="m2-content-area">
          <div className="m2-card" style={{ maxWidth: '620px', margin: '60px auto', textAlign: 'center', padding: '48px 30px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#991b1b', margin: '0 0 8px' }}>
              403 - Quyền Truy Cập Bị Từ Chối
            </h2>
            <p style={{ fontSize: '14.5px', color: '#4b5563', margin: '0 0 24px', lineHeight: '1.6' }}>
              Trang kiểm duyệt và quản lý giảng viên chỉ dành riêng cho tài khoản <strong>Quản Trị Viên (Admin)</strong>.
              {user ? ` Tài khoản hiện tại của bạn có vai trò [${user.role === 'instructor' ? 'Giảng viên' : 'Học viên'}].` : ' Bạn chưa đăng nhập.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="m2-btn m2-btn-primary" onClick={() => navigate('/instructors')}>
                Về danh sách Giảng viên
              </button>
              <button className="m2-btn m2-btn-secondary" onClick={() => navigate('/login')}>
                Đăng nhập tài khoản Admin
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="m2-container">
      <InstructorNav />

      <section className="m2-hero-banner">
        <div className="m2-hero-inner">
          <div>
            <h1 className="m2-hero-title">
              <span style={{ display: 'inline-flex', padding: '6px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </span>
              Quản Trị & Kiểm Duyệt Đội Ngũ Giảng Viên
            </h1>
            <p className="m2-hero-subtitle">
              Khu vực dành riêng cho Ban Quản Trị: Thẩm định hồ sơ năng lực tác giả, kiểm tra bằng cấp chuyên môn, thẩm định đề thi mẫu và quản trị trạng thái hoạt động của giảng viên trên toàn hệ thống.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs chuyển đổi giữa Quản lý danh sách và Kiểm duyệt hồ sơ */}
      <nav className="m2-tabs-bar">
        <div className="m2-tabs-inner">
          <button
            className={`m2-tab-item ${tab === 'list' ? 'active' : ''}`}
            onClick={() => setTab('list')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Danh Sách & Quản Lý Giảng Viên
          </button>

          <button
            className={`m2-tab-item ${tab === 'approve' ? 'active' : ''}`}
            onClick={() => setTab('approve')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Kiểm Duyệt Hồ Sơ Mới
            <span className="m2-tab-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 600 }}>
              Cần thẩm định
            </span>
          </button>
        </div>
      </nav>

      <main className="m2-content-area">
        {tab === 'list' ? <AdminInstructorListView /> : <AdminApprovalView />}
      </main>
    </div>
  );
};

export default AdminInstructorPage;
