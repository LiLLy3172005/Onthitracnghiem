import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InstructorNav } from './InstructorNav';
import { PublicInstructorView } from './PublicInstructorView';
import './Instructor.css';

export const PublicInstructorPage: React.FC = () => {
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  return (
    <div className="m2-container">
      <InstructorNav />

      {/* Hero Banner giới thiệu */}
      <section className="m2-hero-banner">
        <div className="m2-hero-inner">
          <div>
            <h1 className="m2-hero-title">
              <span style={{ display: 'inline-flex', padding: '6px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              Đội Ngũ Giảng Viên & Chuyên Gia Biên Soạn Đề
            </h1>
            <p className="m2-hero-subtitle">
              Danh sách các thầy cô, chuyên gia bộ môn hàng đầu đã được Ban Quản Trị Brain Blitz kiểm duyệt năng lực chuyên môn, chịu trách nhiệm xây dựng ngân hàng câu hỏi chuẩn ma trận thi thật.
            </p>
          </div>

          {user?.role === 'admin' ? (
            <button
              className="m2-btn m2-btn-primary"
              onClick={() => navigate('/admin/instructors')}
              style={{ padding: '12px 22px', fontSize: '14.5px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>Quản trị & Duyệt hồ sơ</span>
            </button>
          ) : user?.role === 'instructor' ? (
            <button
              className="m2-btn m2-btn-primary"
              onClick={() => navigate('/instructor/profile')}
              style={{ padding: '12px 22px', fontSize: '14.5px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Hồ sơ & Bàn làm việc</span>
            </button>
          ) : (
            <button
              className="m2-btn m2-btn-primary"
              onClick={() => navigate('/instructor-register')}
              style={{ padding: '12px 22px', fontSize: '14.5px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Đăng ký trở thành Giảng viên</span>
            </button>
          )}
        </div>
      </section>

      {/* Nội dung danh sách & tìm kiếm */}
      <main className="m2-content-area">
        <PublicInstructorView onRegisterClick={() => navigate('/instructor-register')} />
      </main>
    </div>
  );
};

export default PublicInstructorPage;
