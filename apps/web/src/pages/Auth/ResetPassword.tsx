import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import AuthLayout from './AuthLayout';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, password, password_confirmation: confirmPassword });
      alert('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout withIllustration={false}>
        <h2 className="auth-title">Liên kết không hợp lệ</h2>
        <p className="auth-subtitle">Đường dẫn đặt lại mật khẩu thiếu thông tin hoặc đã hết hạn.</p>
        <button type="button" onClick={() => navigate('/forgot-password')} className="btn-submit">
          Gửi lại liên kết
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="auth-title">
        Đặt lại mật khẩu <span className="auth-brand-highlight">Brain Blitz</span>
      </h2>
      <p className="auth-subtitle">Nhập mật khẩu mới cho tài khoản {email}</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Mật khẩu mới <span className="required-star">*</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Nhập mật khẩu mới" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu mới <span className="required-star">*</span></label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="Nhập lại mật khẩu mới" className="form-input" />
        </div>
        <button type="submit" disabled={loading} className="btn-submit">{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;