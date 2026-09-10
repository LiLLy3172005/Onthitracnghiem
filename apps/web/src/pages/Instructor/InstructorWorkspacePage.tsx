import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InstructorNav } from './InstructorNav';
import { InstructorProfileView } from './InstructorProfileView';
import { CollaboratorView } from './CollaboratorView';
import './Instructor.css';

interface Props {
  initialTab?: 'profile' | 'collab';
}

export const InstructorWorkspacePage: React.FC<Props> = ({ initialTab = 'profile' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'collab'>(
    location.pathname.includes('collaborators') ? 'collab' : initialTab
  );

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (location.pathname.includes('collaborators')) {
      setTab('collab');
    } else {
      setTab('profile');
    }
  }, [location.pathname]);

  const handleTabChange = (newTab: 'profile' | 'collab') => {
    setTab(newTab);
    if (newTab === 'collab') {
      navigate('/instructor/collaborators');
    } else {
      navigate('/instructor/profile');
    }
  };

  // RBAC Guard: Chỉ Giảng viên đã duyệt mới có không gian làm việc này
  if (!user || user.role !== 'instructor') {
    return (
      <div className="m2-container">
        <InstructorNav />
        <main className="m2-content-area">
          <div className="m2-card" style={{ maxWidth: '620px', margin: '60px auto', textAlign: 'center', padding: '48px 30px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', margin: '0 0 8px' }}>
              Không Gian Làm Việc Của Giảng Viên
            </h2>
            <p style={{ fontSize: '14.5px', color: '#4b5563', margin: '0 0 24px', lineHeight: '1.6' }}>
              {user?.role === 'admin'
                ? 'Bạn đang đăng nhập với tư cách Quản trị viên (Admin). Vui lòng sang trang Quản trị & Kiểm duyệt để quản lý hồ sơ.'
                : user
                ? 'Bạn đang đăng nhập với vai trò Học viên. Để tạo đề thi và quản lý nhóm cộng tác, vui lòng nộp hồ sơ đăng ký giảng viên.'
                : 'Vui lòng đăng nhập bằng tài khoản Giảng viên để truy cập không gian làm việc này.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {user?.role === 'admin' ? (
                <button className="m2-btn m2-btn-primary" onClick={() => navigate('/admin/instructors')}>
                  Đến trang Quản trị Admin
                </button>
              ) : (
                <button className="m2-btn m2-btn-primary" onClick={() => navigate('/instructor-register')}>
                  Nộp hồ sơ Giảng viên
                </button>
              )}
              <button className="m2-btn m2-btn-secondary" onClick={() => navigate('/login')}>
                Đăng nhập tài khoản khác
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              Không Gian Làm Việc Của Giảng Viên
            </h1>
            <p className="m2-hero-subtitle">
              Quản lý hồ sơ năng lực chuyên môn, môn học phụ trách biên soạn và phân quyền cho các thành viên trong nhóm cùng hỗ trợ làm đề thi.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs chuyển đổi giữa Hồ sơ và Cộng tác */}
      <nav className="m2-tabs-bar">
        <div className="m2-tabs-inner">
          <button
            className={`m2-tab-item ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Hồ Sơ Chuyên Môn & Môn Phụ Trách
          </button>

          <button
            className={`m2-tab-item ${tab === 'collab' ? 'active' : ''}`}
            onClick={() => handleTabChange('collab')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Nhóm Cộng Tác Biên Soạn Đề
          </button>
        </div>
      </nav>

      <main className="m2-content-area">
        {tab === 'profile' ? <InstructorProfileView /> : <CollaboratorView />}
      </main>
    </div>
  );
};

export default InstructorWorkspacePage;
