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
          <h1>Hồ sơ</h1>
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>

        {message && <div className="profile-message">{message}</div>}

        <section className="profile-card">
          <div className="profile-avatar-lg">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} />
            ) : (
              <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <div className="profile-name-row">
                  <h2>{user?.full_name}</h2>
                  <button className="edit-icon" onClick={() => setIsEditing(true)} title="Chỉnh sửa">✎</button>
                </div>
                <dl className="profile-details">
                  <div><dt>Ngày tham gia</dt><dd>{joinedDate}</dd></div>
                  <div><dt>Vai trò</dt><dd className="capitalize">{user?.role === 'student' ? 'Học viên' : user?.role}</dd></div>
                  <div><dt>Email</dt><dd>{user?.email}</dd></div>
                  <div><dt>Trạng thái</dt><dd className="capitalize">{user?.status === 'active' ? 'Đang hoạt động' : user?.status}</dd></div>
                </dl>
              </>
            ) : (
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
            )}
          </div>
        </section>

        <section className="activity-section">
          <h2>Lịch sử làm bài gần đây</h2>
          <div className="activity-timeline">
            {recentActivity.map((item, i) => (
              <div className="activity-item" key={i}>
                <span className={`activity-dot ${item.status}`} />
                <div className="activity-content">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-detail">{item.detail}</div>
                </div>
                <span className={`activity-status ${item.status}`}>
                  {item.status === 'done' ? 'Hoàn thành' : `Ngày: ${item.date}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className="profile-rightpanel">
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