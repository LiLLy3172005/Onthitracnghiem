import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import Sidebar from '../components/Sidebar';
import './Profile.css';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  created_at?: string;
}

// Dữ liệu tạm — sẽ thay bằng API thật khi Module 5, 6 hoàn thành
const recentActivity = [
  { title: 'Đề tổng hợp - Toán học', detail: '20 câu hỏi, 45 phút', status: 'done', date: '05.09.2026' },
  { title: 'Ngữ pháp cơ bản - Tiếng Anh', detail: '15 câu hỏi, 30 phút', status: 'pending', date: '03.09.2026' },
];

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setFullName(res.data.user.full_name);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/user/profile', { full_name: fullName });
      setUser(res.data.user);
      setIsEditing(false);
      setMessage('Cập nhật thông tin thành công');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // bỏ qua nếu token đã hết hạn
    } finally {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) return <div className="home-loading">Đang tải...</div>;

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="profile-main">
        <div className="profile-topbar">
          <h1>Hồ sơ cá nhân</h1>
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>

        {message && <div className="profile-message">{message}</div>}

        {/* Hero Banner dạng thẻ màu vàng đồng theo ảnh */}
        <section className="profile-hero-card">
          <div className="hero-text-content">
            <h2>Xin chào, {user?.full_name || 'Học viên'}!</h2>
            <p>Tài khoản cá nhân và tổng quan hoạt động ôn luyện của bạn.</p>
            <div className="hero-actions">
              {!isEditing && (
                <button className="hero-edit-btn" onClick={() => setIsEditing(true)}>
                  ✎ Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
          <div className="hero-avatar-wrapper">
            <div className="profile-avatar-lg">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} />
              ) : (
                <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        </section>

        {/* Hàng 4 thẻ thông tin nhỏ giống thiết kế ảnh mẫu */}
        <section className="profile-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <span className="stat-value">{joinedDate}</span>
              <span className="stat-label">Ngày tham gia</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <span className="stat-value capitalize">{user?.role === 'student' ? 'Học viên' : user?.role}</span>
              <span className="stat-label">Vai trò</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✉️</div>
            <div className="stat-info">
              <span className="stat-value" title={user?.email}>{user?.email}</span>
              <span className="stat-label">Email</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <span className="stat-value capitalize">{user?.status === 'active' ? 'Đang hoạt động' : user?.status}</span>
              <span className="stat-label">Trạng thái</span>
            </div>
          </div>
        </section>

        {/* Khung form chỉnh sửa tên nếu đang bật isEditing */}
        {isEditing && (
          <section className="profile-edit-section">
            <h3>Chỉnh sửa thông tin</h3>
            <form onSubmit={handleUpdate} className="profile-edit-form">
              <label>Họ và tên</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <div className="edit-actions">
                <button type="submit" disabled={saving} className="save-btn">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => { setIsEditing(false); setFullName(user?.full_name || ''); }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Danh sách lịch sử làm bài */}
        <section className="activity-section">
          <h2>Lịch sử làm bài gần đây</h2>
          <div className="activity-list">
            {recentActivity.map((item, i) => (
              <div className="activity-card" key={i}>
                <div className="activity-badge">{item.date}</div>
                <div className="activity-content">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-detail">{item.detail}</div>
                </div>
                <span className={`activity-status ${item.status}`}>
                  {item.status === 'done' ? 'Hoàn thành' : 'Đang chờ'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Cột bên phải màu kem nhạt đồng bộ ảnh */}
      <aside className="profile-rightpanel">
        <div className="rightpanel-header">
          <h2>Tài khoản</h2>
        </div>

        <div className="side-card">
          <h3>Bảo mật tài khoản</h3>
          <p>Đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
          <button className="side-card-btn" onClick={() => navigate('/change-password')}>
            Đổi mật khẩu
          </button>
        </div>

        <div className="side-card side-card-dark">
          <h3>Brain Blitz Premium</h3>
          <p>Mở khóa đề thi nâng cao và thống kê chi tiết.</p>
          <button className="side-card-btn side-card-btn-light" disabled>
            Sắp ra mắt
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Profile;