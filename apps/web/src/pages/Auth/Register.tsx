import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import AuthLayout from './AuthLayout';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { full_name: fullName, email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth-title">
        Tạo tài khoản <span className="auth-brand-highlight">Brain Blitz</span>
      </h2>
      <p className="auth-subtitle">Tham gia để bắt đầu ôn thi và học tập ngay!</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Họ và tên <span className="required-star">*</span></label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Nhập họ và tên" className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Email <span className="required-star">*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Nhập email của bạn" className="form-input" />
        </div>
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Mật khẩu <span className="required-star">*</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" className="form-input" />
        </div>
        <button type="submit" disabled={loading} className="btn-submit">{loading ? 'Đang tạo...' : 'Đăng ký'}</button>
        <p className="auth-footer">
          Đã có tài khoản?{' '}
          <button type="button" onClick={() => navigate('/login')} className="btn-switch">Đăng nhập</button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;