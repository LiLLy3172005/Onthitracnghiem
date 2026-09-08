import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import Sidebar from '../components/Sidebar.tsx';
import './Home.css';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

// Dữ liệu tạm — sẽ thay bằng API thật khi Module 3, 4, 5 hoàn thành
const subjects = [
  { name: 'Toán học', count: 128, color: 'card-indigo' },
  { name: 'Vật lý', count: 94, color: 'card-slate' },
  { name: 'Tiếng Anh', count: 156, color: 'card-amber' },
];

const recentExams = [
  { subject: 'Toán học', title: 'Đề tổng hợp', date: '05.09.2026', status: 'done' },
  { subject: 'Tiếng Anh', title: 'Ngữ pháp cơ bản', date: '03.09.2026', status: 'pending' },
  { subject: 'Vật lý', title: 'Cơ học', date: '01.09.2026', status: 'done' },
];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Thứ 2 = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigate]);

  if (loading) return <div className="home-loading">Đang tải...</div>;

  const today = new Date();
  const cells = getMonthGrid(today.getFullYear(), today.getMonth());
  const monthName = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const firstName = user?.full_name?.split(' ').slice(-1)[0] || 'bạn';

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="home-main">
        <div className="home-topbar">
          <input className="home-search" placeholder="Tìm môn học, đề thi..." />
          <span className="home-date">
            {today.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <section className="home-banner">
          <div className="home-banner-text">
            <h1>Chào mừng trở lại, {firstName}!</h1>
            <p>Tiếp tục ôn tập để giữ vững phong độ của bạn hôm nay.</p>
            <button className="banner-cta" onClick={() => navigate('/exams')}>
              Làm đề ngay
            </button>
          </div>
        </section>

        <div className="home-section-header">
          <h2>Môn học</h2>
          <button className="see-all" onClick={() => navigate('/subjects')}>Xem tất cả</button>
        </div>
        <div className="home-classes">
          {subjects.map((s) => (
            <div key={s.name} className={`class-card ${s.color}`}>
              <h3>{s.name}</h3>
              <p>{s.count} câu hỏi</p>
            </div>
          ))}
        </div>

        <div className="home-section-header">
          <h2>Đề thi gần đây</h2>
          <button className="see-all" onClick={() => navigate('/history')}>Xem tất cả</button>
        </div>
        <table className="home-table">
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Đề thi</th>
              <th>Ngày làm</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {recentExams.map((e, i) => (
              <tr key={i}>
                <td>{e.subject}</td>
                <td>{e.title}</td>
                <td>{e.date}</td>
                <td>
                  <span className={`status-badge ${e.status}`}>
                    {e.status === 'done' ? 'Hoàn thành' : 'Chưa làm'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <aside className="home-rightpanel">
        <div className="profile-mini" onClick={() => navigate('/profile')}>
          <div className="profile-mini-avatar">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} />
            ) : (
              <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="profile-mini-name">{user?.full_name}</div>
          <div className="profile-mini-role">{user?.role === 'student' ? 'Học viên' : user?.role}</div>
          <button
            className="profile-mini-btn"
            onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
          >
            Xem hồ sơ
          </button>
        </div>

        <div className="mini-calendar">
          <div className="mini-calendar-header">{monthName}</div>
          <div className="mini-calendar-weekdays">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => <span key={d}>{d}</span>)}
          </div>
          <div className="mini-calendar-grid">
            {cells.map((d, i) => (
              <span key={i} className={d === today.getDate() ? 'cal-day is-today' : d ? 'cal-day' : 'cal-day is-empty'}>
                {d || ''}
              </span>
            ))}
          </div>
        </div>

        <div className="reminders">
          <div className="reminders-title">Nhắc nhở</div>
          <div className="reminder-item">
            <span className="reminder-dot" />
            <div>
              <div className="reminder-text">Đề Tiếng Anh - hạn nộp hôm nay</div>
              <div className="reminder-time">17:00</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Home;