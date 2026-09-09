import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '@onthitracnghiem/shared';
import Sidebar from '../components/Sidebar';
import RotatingBadge from '../components/RotatingBadge';
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

// Dữ liệu tạm — sẽ thay bằng API thật khi Module 5, 6 hoàn thành.
// Lịch sử làm bài lấy từ bảng exam_attempts (submitted_at, total_score).
const recentActivity = [
  { title: 'Đề tổng hợp - Toán học', detail: '20 câu hỏi, 45 phút', status: 'done', date: '05.09.2026', day: 5 },
  { title: 'Ngữ pháp cơ bản - Tiếng Anh', detail: '15 câu hỏi, 30 phút', status: 'pending', date: '03.09.2026', day: 3 },
];

// Bảng xếp hạng — sẽ thay bằng API GET /leaderboard truy vấn learning_records
// (ORDER BY average_score DESC), JOIN users để lấy tên.
const leaderboard = [
  { rank: 1, name: 'Nguyễn Minh Anh', score: 9.8 },
  { rank: 2, name: 'Trần Gia Bảo', score: 9.6 },
  { rank: 3, name: 'Lê Thị Hà', score: 9.4 },
  { rank: 4, name: 'Phạm Đức Long', score: 9.1 },
];

const reminders = [
  { text: 'Đề Tiếng Anh - hạn nộp hôm nay', time: '17:00' },
];

const easeOutCurve = [0.16, 1, 0.3, 1] as const;
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutCurve } },
} as const;
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

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

  const today = new Date();
  const cells = getMonthGrid(today.getFullYear(), today.getMonth());
  const monthName = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const activityDays = recentActivity.map((a) => a.day);

  return (
    <div className="app-shell">
      <Sidebar />

      <motion.main
        className="profile-main"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp} className="profile-topbar">
          <h1>Hồ sơ cá nhân - <span className="brand-accent">Brain Blitz</span></h1>
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </motion.div>

        {message && <div className="profile-message">{message}</div>}

        {/* Hero Banner */}
        <motion.section variants={fadeInUp} className="profile-hero-card">
          <span className="hero-decor-circle c1" />
          <span className="hero-decor-circle c2" />

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
            <div className="hero-rotating-wrap">
  <RotatingBadge text="BRAIN BLITZ • HỌC VIÊN • " centerIcon="🏅" size={130} />
</div>
            <div className="profile-avatar-lg">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} />
              ) : (
                <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
        </motion.section>

        {/* 4 thẻ chỉ số */}
        <motion.section variants={fadeInUp} className="profile-stats-grid">
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
        </motion.section>

        {isEditing && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="profile-edit-section"
          >
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
          </motion.section>
        )}

        {/* Lịch sử làm bài */}
        <motion.section variants={fadeInUp} className="activity-section">
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
        </motion.section>
      </motion.main>

      {/* Panel phải */}
      <motion.aside
        className="profile-rightpanel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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

        {/* Bảng xếp hạng - dựa trên learning_records.average_score */}
        <div className="side-card">
          <h3>🏆 Bảng xếp hạng tuần</h3>
          <div className="leaderboard-list">
            {leaderboard.map((row) => (
              <div className="leaderboard-row" key={row.rank}>
                <span className={`leaderboard-rank ${row.rank === 1 ? 'top1' : row.rank === 2 ? 'top2' : row.rank === 3 ? 'top3' : ''}`}>
                  #{row.rank}
                </span>
                <span className="leaderboard-name">{row.name}</span>
                <span className="leaderboard-score">{row.score}</span>
              </div>
            ))}
          </div>
          <div className="leaderboard-note">Bạn đang xếp hạng #12 trong tuần này</div>
        </div>

        {/* Lịch mini - bôi đậm ngày đã làm đề, dựa trên exam_attempts.submitted_at */}
        <div className="side-card calendar-card">
          <div className="calendar-title">{monthName}</div>
          <div className="calendar-weekdays">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="calendar-days-grid">
            {cells.map((d, i) => {
              const isToday = d === today.getDate();
              const hasActivity = d !== null && activityDays.includes(d);
              return (
                <span
                  key={i}
                  className={
                    'day-cell' +
                    (isToday ? ' is-today' : '') +
                    (hasActivity && !isToday ? ' has-activity' : '') +
                    (d === null ? ' empty' : '')
                  }
                  title={hasActivity ? 'Đã làm đề ngày này' : undefined}
                >
                  {d || ''}
                </span>
              );
            })}
          </div>
        </div>

        {/* Nhắc nhở */}
        <div className="side-card">
          <div className="reminders-title">Nhắc nhở</div>
          {reminders.map((r, i) => (
            <div className="reminder-item" key={i}>
              <span className="reminder-dot" />
              <div>
                <div className="reminder-text">{r.text}</div>
                <div className="reminder-time">{r.time}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
};

export default Profile;