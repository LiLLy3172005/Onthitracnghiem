import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InstructorNav } from './InstructorNav';
import { InstructorRegisterView } from './InstructorRegisterView';
import './Instructor.css';

export const InstructorRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  if (user?.role === 'instructor') {
    return (
      <div className="m2-container">
        <InstructorNav />
        <main className="m2-content-area">
          <div className="m2-card" style={{ maxWidth: '620px', margin: '60px auto', textAlign: 'center', padding: '48px 30px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', margin: '0 0 8px' }}>
              Bạn Đã Là Giảng Viên Chính Thức
            </h2>
            <p style={{ fontSize: '14.5px', color: '#4b5563', margin: '0 0 24px', lineHeight: '1.6' }}>
              Tài khoản của bạn đã có quyền Giảng viên biên soạn đề thi. Bạn không cần nộp lại hồ sơ đăng ký.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="m2-btn m2-btn-primary" onClick={() => navigate('/instructor/profile')}>
                Vào Bàn làm việc Giảng viên
              </button>
              <button className="m2-btn m2-btn-secondary" onClick={() => navigate('/instructors')}>
                Xem danh sách Giảng viên
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="m2-container">
        <InstructorNav />
        <main className="m2-content-area">
          <div className="m2-card" style={{ maxWidth: '620px', margin: '60px auto', textAlign: 'center', padding: '48px 30px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#92400e', margin: '0 0 8px' }}>
              Tài Khoản Quản Trị Viên (Admin)
            </h2>
            <p style={{ fontSize: '14.5px', color: '#4b5563', margin: '0 0 24px', lineHeight: '1.6' }}>
              Bạn đang sử dụng quyền Quản trị viên. Hãy vào khu vực Quản trị & Kiểm duyệt để xét duyệt hồ sơ của các giảng viên khác.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="m2-btn m2-btn-primary" onClick={() => navigate('/admin/instructors')}>
                Đến trang Quản trị & Kiểm duyệt
              </button>
              <button className="m2-btn m2-btn-secondary" onClick={() => navigate('/instructors')}>
                Xem danh sách Giảng viên
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              Đăng Ký Trở Thành Giảng Viên / Người Tạo Đề
            </h1>
            <p className="m2-hero-subtitle">
              Nộp thông tin, chuyên môn và các môn học bạn phụ trách để tham gia vào đội ngũ biên soạn đề thi thông minh của Brain Blitz.
            </p>
          </div>
        </div>
      </section>

      <main className="m2-content-area">
        <InstructorRegisterView onSuccessRedirect={() => navigate('/instructors')} />
      </main>
    </div>
  );
};

export default InstructorRegisterPage;
