import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import AuthLayout from './AuthLayout';

interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: { id: number; full_name: string; email: string; role: string; avatar_url?: string };
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth-title">
        Đăng nhập vào <span className="auth-brand-highlight">Brain Blitz</span>
      </h2>
      <p className="auth-subtitle">Luyện thi trắc nghiệm & tiếp tục học tập ngay!</p>

      <button type="button" className="btn-google">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Đăng nhập với Google
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">hoặc dùng</span>
        <div className="auth-divider-line" />
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email <span className="required-star">*</span></label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Nhập email của bạn" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Mật khẩu <span className="required-star">*</span></label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Nhập mật khẩu của bạn" className="form-input" />
        </div>
        <div className="form-options">
          <label className="checkbox-label"><input type="checkbox" /> Ghi nhớ tôi</label>
          <button type="button" onClick={() => navigate('/forgot-password')} className="forgot-link">Quên mật khẩu?</button>
        </div>
        <button type="submit" disabled={loading} className="btn-submit">{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
        <p className="auth-footer">
          Chưa có tài khoản?{' '}
          <button type="button" onClick={() => navigate('/register')} className="btn-switch">Đăng ký</button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;