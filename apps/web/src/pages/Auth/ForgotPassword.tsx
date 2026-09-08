import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import './Auth.css';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsError(false);
      setMessage(res.data.message);
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Có lỗi xảy ra, thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Cột trái: Ảnh minh họa */}
        <div className="auth-left-col">
          <div className="auth-avatar-circle">
            <img
              src="/anhcaube.jpg"
              alt="Brain Blitz Minh Họa"
              className="auth-illustration-img"
            />
          </div>
        </div>

        {/* Cột phải: Form Quên mật khẩu */}
        <div className="auth-right-col">
          <h2 className="auth-title">
            Quên mật khẩu <span className="auth-brand-highlight">Brain Blitz</span>
          </h2>
          <p className="auth-subtitle">Nhập email để nhận liên kết đặt lại mật khẩu</p>

          {message && (
            <div className={isError ? 'auth-error' : 'auth-success'}>{message}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="required-star">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Nhập email của bạn"
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
            </button>

            <p className="auth-footer">
              Nhớ mật khẩu rồi?{' '}
              <button type="button" onClick={() => navigate('/login')} className="btn-switch">
                Đăng nhập
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;