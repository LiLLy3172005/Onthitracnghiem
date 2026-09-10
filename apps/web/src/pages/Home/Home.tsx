import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@onthitracnghiem/shared';
import './Home.css';
import RotatingBadge from '../components/RotatingBadge';
import { NotificationDropdown } from '../Notification/components/NotificationDropdown';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

const subjects = [
  {
    id: 'math',
    name: 'Toán học',
    count: 128,
    tags: ['Giải tích 12', 'Hình học không gian', 'Đề THPTQG 2026', 'Thi thử ĐGNL'],
    desc: 'Hệ thống câu hỏi phân loại từ cơ bản đến vận dụng cao, tự động giải thích chi tiết kèm công thức nhanh.',
  },
  {
    id: 'physics',
    name: 'Vật lý',
    count: 94,
    tags: ['Dao động cơ', 'Sóng cơ & Sóng âm', 'Dòng điện xoay chiều', 'Vật lý hạt nhân'],
    desc: 'Tổng hợp các bài tập trắc nghiệm lý thuyết và bài tập tính toán có sơ đồ minh họa rõ ràng.',
  },
  {
    id: 'english',
    name: 'Tiếng Anh',
    count: 156,
    tags: ['Ngữ pháp trọng tâm', 'Từ vựng B1-C1', 'Bài đọc hiểu', 'Đề minh họa 2026'],
    desc: 'Chữa lỗi sai trực tiếp, giải thích từ vựng theo ngữ cảnh và đề thi thử cập nhật theo cấu trúc mới.',
  },
];

const recentExams = [
  { subject: 'Toán học', title: 'Đề tổng hợp - Hàm số & Tích phân', date: '05.09.2026', status: 'done' },
  { subject: 'Tiếng Anh', title: 'Ngữ pháp cơ bản - 12 Thì Tiếng Anh', date: '03.09.2026', status: 'pending' },
  { subject: 'Vật lý', title: 'Cơ học & Dao động điều hòa', date: '01.09.2026', status: 'done' },
];

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const easeOutCurve = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutCurve } }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};
const stats = [
  { number: '50,000+', label: 'Học viên đang sử dụng' },
  { number: '12,000+', label: 'Câu hỏi trắc nghiệm' },
  { number: '3,500+', label: 'Đề thi thử đã tạo' },
  { number: '4.9/5', label: 'Đánh giá trung bình' },
];

const features = [
  { icon: '🎯', title: 'Phân tích lỗ hổng kiến thức', desc: 'AI chỉ ra chính xác phần kiến thức bạn còn yếu sau mỗi lần làm đề.' },
  { icon: '📚', title: 'Ngân hàng câu hỏi khổng lồ', desc: 'Hàng nghìn câu hỏi chuẩn cấu trúc đề thi, cập nhật liên tục theo năm học.' },
  { icon: '📈', title: 'Theo dõi tiến độ chi tiết', desc: 'Biểu đồ điểm số theo thời gian, so sánh với chính bạn của tuần trước.' },
  { icon: '⚡', title: 'Luyện đề tốc độ', desc: 'Chấm điểm tức thì, giải thích đáp án chi tiết ngay sau khi nộp bài.' },
];

const marqueeItems = [
  'TOÁN HỌC', 'VẬT LÝ', 'TIẾNG ANH', 'HÓA HỌC',
  'SINH HỌC', 'LUYỆN ĐỀ THPTQG', 'ĐÁNH GIÁ NĂNG LỰC', 'PHÂN TÍCH AI',
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string>('math');

  const isLoggedIn = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Không có token -> đây là khách, không gọi API, không chặn trang
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        // Token hết hạn / không hợp lệ -> âm thầm xóa, không redirect
        // vì trang Home vẫn xem được ở trạng thái khách
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setCheckingAuth(false);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // bỏ qua nếu token đã hết hạn
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Khi bấm hành động cần đăng nhập (làm đề, vào môn học chi tiết...) mà chưa có tài khoản
  const goOrLogin = (path: string) => {
    navigate(isLoggedIn ? path : '/register');
  };

  if (checkingAuth) return <div className="home-loading">Đang tải...</div>;

  const today = new Date();
  const cells = getMonthGrid(today.getFullYear(), today.getMonth());
  const monthName = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const firstName = user?.full_name?.split(' ').slice(-1)[0];

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <motion.header
        className="landing-navbar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="nav-logo" onClick={() => navigate('/')}>
          <motion.span className="logo-badge" whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>⚡</motion.span>
          <span className="logo-text">Brain Blitz</span>
        </div>

        <nav className="nav-menu">
          <button className="nav-item active" onClick={() => navigate('/')}>Trang chủ</button>
          <button className="nav-item" onClick={() => goOrLogin('/subjects')}>Môn học</button>
          {isLoggedIn && (
            <>
              <button className="nav-item" onClick={() => navigate('/exams')}>Đề thi</button>
              <button className="nav-item" onClick={() => navigate('/history')}>Lịch sử</button>
              <button className="nav-item" onClick={() => navigate('/notifications')}>Thông báo</button>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              <NotificationDropdown theme="dark" />
              <button className="nav-item" onClick={() => navigate('/profile')}>Hồ sơ</button>
              <motion.button
                className="cta-header-btn"
                onClick={() => navigate('/exams')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Làm đề ngay <span>➔</span>
              </motion.button>
              <button className="nav-logout-btn" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="nav-item" onClick={() => navigate('/login')}>Đăng nhập</button>
              <motion.button
                className="cta-header-btn"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đăng ký miễn phí <span>➔</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
    {/* Hero Section - bố cục 2 cột theo tham khảo */}
<motion.section
  className="hero-v2"
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
  <div className="hero-left">
    <motion.div variants={fadeInUp} className="hero-badge-pill">
      <span className="dot">●</span> Nền tảng ôn thi trắc nghiệm AI #1
    </motion.div>

    <motion.h1 variants={fadeInUp} className="hero-heading-v2">
      Chinh phục mọi kỳ thi cùng <br />
      <span className="highlight-text">{isLoggedIn ? `cùng ${firstName}` : 'Brain Blitz'}</span>
    </motion.h1>

    <motion.p variants={fadeInUp} className="hero-lead">
      Luyện đề thông minh, phân tích lỗ hổng kiến thức và tối ưu hóa điểm số với hàng nghìn câu hỏi trắc nghiệm chuẩn cấu trúc Bộ GD&ĐT.
    </motion.p>

    <motion.div variants={fadeInUp} className="hero-buttons">
      <motion.button
        className="btn-primary-gold"
        onClick={() => goOrLogin('/exams')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoggedIn ? 'Làm đề ngay' : 'Đăng ký miễn phí'} <span className="arrow-circle">➔</span>
      </motion.button>
      <motion.button
        className="btn-secondary-white"
        onClick={() => document.querySelector('.subjects-section')?.scrollIntoView({ behavior: 'smooth' })}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Khám phá môn học
      </motion.button>
    </motion.div>

    <motion.div variants={fadeInUp} className="hero-social-row">
      <div className="social-icons">
        <a href="#" className="social-icon-btn" aria-label="Facebook">f</a>
        <a href="#" className="social-icon-btn" aria-label="YouTube">▶</a>
        <a href="#" className="social-icon-btn" aria-label="TikTok">♪</a>
      </div>
      <div className="rating-inline">
        <div className="rating-avatars">
          <span className="avatar-chip">🎓</span>
          <span className="avatar-chip">⭐</span>
          <span className="avatar-chip">📚</span>
        </div>
        <div className="rating-info">
          <strong>50,000+ Học viên</strong>
          <span>Đánh giá 4.9/5 trên toàn quốc</span>
        </div>
      </div>
    </motion.div>
  </div>

  <motion.div variants={fadeInUp} className="hero-right-v2">
   

    <div className="hero-photo-frame">
      <div className="hero-photo-blob-bg" />
      <div className="hero-photo-img">
        <img src="/hero-photo.png" alt="Học viên Brain Blitz" />
      </div>
      
 <div className="hero-rotating-wrap">
      <RotatingBadge text="ÔN THI THÔNG MINH • AI PHÂN TÍCH • " centerIcon="⚡" />
    </div>
      <motion.div
        className="floating-badge floating-badge-1"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        📊 12,000+ câu hỏi
      </motion.div>

      <motion.div
        className="floating-badge floating-badge-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        🎯 Phân tích lỗ hổng AI
      </motion.div>

      <motion.div
        className="floating-badge floating-badge-3"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        ⏱ Chấm điểm tức thì
      </motion.div>
    </div>
  </motion.div>
</motion.section>

      {/* Marquee */}
    <div className="marquee-strip">
  <div className="marquee-content">
    {[...marqueeItems, ...marqueeItems].map((item, i) => (
      <span key={i} className="marquee-item">
        {item} <span className="marquee-dot">✦</span>
      </span>
    ))}
  </div>
</div>

{/* Stats Bar */}
<section className="stats-bar">
  {stats.map((s) => (
    <div className="stat-item" key={s.label}>
      <span className="stat-number">{s.number}</span>
      <span className="stat-label">{s.label}</span>
    </div>
  ))}
</section>

{/* Features Section */}
<motion.section
  className="features-section"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: '-100px' }}
  variants={fadeInUp}
>
  <div className="section-header-pill"><span>● Tính năng nổi bật</span></div>
  <div className="section-title-row">
    <h2>Vì Sao Chọn Brain Blitz?</h2>
  </div>
  <div className="features-grid">
    {features.map((f) => (
      <div className="feature-card" key={f.title}>
        <div className="feature-icon">{f.icon}</div>
        <h3>{f.title}</h3>
        <p>{f.desc}</p>
      </div>
    ))}
  </div>
</motion.section>

      {/* Accordion Môn học - công khai, ai cũng xem được */}
      <motion.section
        className="subjects-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
      >
        <div className="section-header-pill"><span>● Danh mục môn học</span></div>
        <div className="section-title-row">
          <h2>Hệ Thống Môn Học & Lộ Trình Ôn Thi</h2>
          <button className="btn-view-all" onClick={() => goOrLogin('/subjects')}>
            Xem tất cả môn <span>➔</span>
          </button>
        </div>

        <div className="accordion-list">
          {subjects.map((sub, index) => {
            const isExpanded = activeSubject === sub.id;
            return (
              <motion.div
                key={sub.id}
                layout
                className={`accordion-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setActiveSubject(sub.id)}
                transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
              >
                <motion.div layout="position" className="card-header-line">
                  <span className="card-num">0{index + 1}.</span>
                  <h3 className="card-title">{sub.name}</h3>
                  <motion.button className="card-arrow-btn" animate={{ rotate: isExpanded ? 45 : 0 }}>↗</motion.button>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="card-expanded-body"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="sub-tag-list">
                        {sub.tags.map((t) => <span key={t} className="sub-tag">{t}</span>)}
                      </div>
                      <p className="sub-desc">{sub.desc}</p>
                      <div className="sub-footer-meta">
                        <span>Số lượng câu hỏi: <strong>{sub.count}+ câu</strong></span>
                        <button className="btn-start-sub" onClick={() => goOrLogin('/exams')}>
                          {isLoggedIn ? 'Vào luyện đề ngay' : 'Đăng ký để luyện đề'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Phần dữ liệu cá nhân - chỉ hiện khi đã đăng nhập */}
      {isLoggedIn && (
        <motion.section
          className="dashboard-grid-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
        >
          <div className="grid-left-col">
            <div className="section-header-pill"><span>● Tiến độ cá nhân</span></div>
            <h2 className="grid-heading">Lịch Sử Làm Bài Gần Đây</h2>

            <div className="table-card-wrapper">
              <table className="landing-table">
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th>Tên đề thi</th>
                    <th>Ngày làm</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExams.map((e, i) => (
                    <tr key={i}>
                      <td><strong className="sub-badge">{e.subject}</strong></td>
                      <td>{e.title}</td>
                      <td>{e.date}</td>
                      <td>
                        <span className={`status-pill ${e.status}`}>
                          {e.status === 'done' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-right-col">
            <motion.div className="user-mini-card" whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <div className="mini-avatar-wrapper">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} />
                ) : (
                  <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="mini-user-info">
                <h3>{user?.full_name}</h3>
                <p>{user?.role === 'student' ? 'Học viên chính thức' : user?.role}</p>
              </div>
              <button className="mini-profile-btn" onClick={() => navigate('/profile')}>Hồ sơ ➔</button>
            </motion.div>

            <div className="calendar-card">
              <div className="calendar-title">{monthName}</div>
              <div className="calendar-weekdays">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => <span key={d}>{d}</span>)}
              </div>
              <div className="calendar-days-grid">
                {cells.map((d, i) => (
                  <span key={i} className={d === today.getDate() ? 'day-cell is-today' : d ? 'day-cell' : 'day-cell empty'}>
                    {d || ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Banner cuối trang - khác nhau tùy trạng thái */}
      <motion.footer
        className="landing-footer-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <h2>
          {isLoggedIn ? 'Sẵn sàng bứt phá điểm số ngay hôm nay?' : 'Bắt đầu ôn thi miễn phí ngay hôm nay'}
        </h2>
        <p>
          {isLoggedIn
            ? 'Tiếp tục ôn luyện và trải nghiệm hệ thống trắc nghiệm thông minh.'
            : 'Tạo tài khoản trong 30 giây, truy cập ngay hàng nghìn câu hỏi trắc nghiệm.'}
        </p>
        <motion.button
          className="btn-primary-gold"
          onClick={() => goOrLogin('/exams')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoggedIn ? 'Bắt đầu ôn thi ngay' : 'Đăng ký miễn phí ngay'} ➔
        </motion.button>
      </motion.footer>


      {/* Footer thật */}
<footer className="site-footer">
  <div className="footer-columns">
    <div className="footer-brand">
      <div className="nav-logo" style={{ marginBottom: 4 }}>
        <span className="logo-badge" style={{ background: 'var(--gold-accent)' }}>⚡</span>
        <span className="logo-text" style={{ color: 'var(--dark-ink)' }}>Brain Blitz</span>
      </div>
      <p>Nền tảng ôn thi trắc nghiệm thông minh, giúp học sinh THPT chinh phục mọi kỳ thi.</p>
      <div className="footer-social">
        <a href="#" aria-label="Facebook">f</a>
        <a href="#" aria-label="YouTube">▶</a>
        <a href="#" aria-label="TikTok">♪</a>
      </div>
    </div>

    <div className="footer-col">
      <h4>Sản phẩm</h4>
      <a href="#" onClick={(e) => { e.preventDefault(); navigate('/subjects'); }}>Môn học</a>
      <a href="#" onClick={(e) => { e.preventDefault(); navigate('/exams'); }}>Đề thi</a>
      <a href="#" onClick={(e) => { e.preventDefault(); }}>Bảng giá</a>
    </div>

    <div className="footer-col">
      <h4>Công ty</h4>
      <a href="#">Giới thiệu</a>
      <a href="#">Tuyển dụng</a>
      <a href="#">Liên hệ</a>
    </div>

    <div className="footer-col">
      <h4>Hỗ trợ</h4>
      <a href="#">Câu hỏi thường gặp</a>
      <a href="#">Điều khoản dịch vụ</a>
      <a href="#">Chính sách bảo mật</a>
    </div>
  </div>

  <div className="footer-bottom">
    © 2026 Brain Blitz. Bảo lưu mọi quyền.
  </div>
</footer>
    </div>
  );
};

export default Home;