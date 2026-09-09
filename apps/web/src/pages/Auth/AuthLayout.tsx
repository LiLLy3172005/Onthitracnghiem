import React from 'react';
import { useNavigate } from 'react-router-dom';
import RotatingBadge from '../components/RotatingBadge';
import './Auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  withIllustration?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, withIllustration = true }) => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-bg-decor" aria-hidden="true">
        <span className="bg-circle circle-1" />
        <span className="bg-circle circle-2" />
        <span className="bg-circle circle-3" />
        <span className="bg-circle circle-4" />
      </div>

      <header className="auth-navbar">
        <div className="auth-nav-logo" onClick={() => navigate('/')}>
          <span className="auth-logo-badge">⚡</span>
          Brain Blitz
        </div>
        <nav className="auth-nav-menu">
          <button className="auth-nav-item" onClick={() => navigate('/')}>Trang chủ</button>
          <button className="auth-nav-item" onClick={() => navigate('/subjects')}>Môn học</button>
        </nav>
        <button className="auth-nav-cta" onClick={() => navigate('/register')}>
          Đăng ký miễn phí <span>➔</span>
        </button>
      </header>

      <div className="auth-card">
        {withIllustration && (
          <div className="auth-left-col">
            <div className="auth-avatar-ring">
              <div className="auth-avatar-outer-ring" />
              <div className="auth-avatar-circle">
                <img src="/anhcaube.jpg" alt="Brain Blitz Minh Họa" className="auth-illustration-img" />
              </div>
              <div className="auth-badge-wrap">
                <RotatingBadge text="ÔN THI THÔNG MINH • AI PHÂN TÍCH • " centerIcon="⚡" />
              </div>
            </div>
          </div>
        )}

        <div className="auth-right-col" style={!withIllustration ? { flex: 1 } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;