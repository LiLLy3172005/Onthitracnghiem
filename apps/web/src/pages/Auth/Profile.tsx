import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';
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

export const PRESET_AVATARS = [
  { id: 'p1', label: 'Thầy giáo thanh lịch', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' },
  { id: 'p2', label: 'Cô giáo thanh lịch', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
  { id: 'p3', label: 'Giảng viên trẻ nam', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: 'p4', label: 'Giảng viên trẻ nữ', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200' },
  { id: 'p5', label: 'Chuyên gia cao cấp', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { id: 'p6', label: 'Nữ học giả', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [initialAvatarUrl, setInitialAvatarUrl] = useState('');
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    file: File | null;
    previewUrl: string;
  }>({
    isOpen: false,
    file: null,
    previewUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setFullName(res.data.user.full_name);
      const currentAvatar = res.data.user.avatar_url || '';
      setAvatarUrl(currentAvatar);
      setInitialAvatarUrl(currentAvatar);
      setPendingAvatarFile(null);
    } catch {
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF)' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Dung lượng ảnh tối đa là 5MB' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewModal({
      isOpen: true,
      file,
      previewUrl: objectUrl,
    });
  };

  const applyPreviewAvatar = () => {
    if (!previewModal.file || !previewModal.previewUrl) return;
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    setPendingAvatarFile(previewModal.file);
    setAvatarUrl(previewModal.previewUrl);
    setPreviewModal({ isOpen: false, file: null, previewUrl: '' });
    setToast({ type: 'info', message: 'Đã áp dụng ảnh xem trước. Nhấn "Lưu thay đổi" để hoàn tất cập nhật.' });
  };

  const cancelPreviewModal = () => {
    if (previewModal.previewUrl && previewModal.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewModal.previewUrl);
    }
    setPreviewModal({ isOpen: false, file: null, previewUrl: '' });
  };

  const handleRevertAvatar = () => {
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    setPendingAvatarFile(null);
    setAvatarUrl(initialAvatarUrl);
    setToast({ type: 'info', message: 'Đã khôi phục lại ảnh đại diện ban đầu.' });
  };

  const handleSelectPreset = (url: string) => {
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    setPendingAvatarFile(null);
    setAvatarUrl(url);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      let finalAvatar = avatarUrl;

      // Nếu có ảnh mới từ máy tính, tải lên server trước khi cập nhật hồ sơ
      if (pendingAvatarFile) {
        setUploadingAvatar(true);
        try {
          const formData = new FormData();
          formData.append('avatar', pendingAvatarFile);
          const uploadRes = await api.post('/user/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.avatar_url) {
            finalAvatar = uploadRes.data.avatar_url;
            setInitialAvatarUrl(finalAvatar);
            setPendingAvatarFile(null);
          }
        } catch (uploadErr: any) {
          setToast({
            type: 'error',
            message: uploadErr.response?.data?.message || 'Lỗi khi tải ảnh đại diện lên máy chủ.',
          });
          setSaving(false);
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const payload: any = { full_name: fullName, avatar_url: finalAvatar.trim() };
      const res = await api.put('/user/profile', payload);
      setUser(res.data.user);
      setInitialAvatarUrl(res.data.user.avatar_url || '');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.dispatchEvent(new CustomEvent('user_updated', { detail: res.data.user }));
      window.dispatchEvent(new Event('storage'));
      setIsEditing(false);
      setToast({ type: 'success', message: 'Cập nhật thông tin và ảnh đại diện thành công!' });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setToast({
          type: 'error',
          message: 'Phiên đăng nhập đã hết hạn. Đang chuyển về trang đăng nhập...',
        });
        setTimeout(() => navigate('/login'), 1200);
        return;
      }
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Cập nhật thông tin thất bại. Vui lòng thử lại.',
      });
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

        {toast && (
          <div className={`profile-message profile-message-${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Hero Banner */}
        <motion.section variants={fadeInUp} className="profile-hero-card">
          <span className="hero-decor-circle c1" />
          <span className="hero-decor-circle c2" />

          <div className="hero-text-content">
            <h2>Xin chào, {user?.full_name || 'Học viên'}!</h2>
            <p>Tài khoản cá nhân và tổng quan hoạt động ôn luyện của bạn.</p>
            <div className="hero-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className="hero-edit-btn"
                onClick={() => {
                  const next = !isEditing;
                  setIsEditing(next);
                  if (next) {
                    setFullName(user?.full_name || '');
                    setAvatarUrl(user?.avatar_url || '');
                  }
                }}
              >
                {isEditing ? '✕ Đóng chỉnh sửa' : '✎ Chỉnh sửa tài khoản'}
              </button>

              {user?.role === 'admin' && (
                <button
                  className="hero-edit-btn"
                  style={{ background: '#d97706', color: '#ffffff', borderColor: '#d97706' }}
                  onClick={() => navigate('/admin/instructors')}
                >
                  🛡️ Quản trị Giảng viên
                </button>
              )}
              {user?.role === 'instructor' && (
                <button
                  className="hero-edit-btn"
                  style={{ background: '#d97706', color: '#ffffff', borderColor: '#d97706' }}
                  onClick={() => navigate('/instructor/profile')}
                >
                  👨‍🏫 Hồ sơ Chuyên môn Giảng viên
                </button>
              )}
              {user?.role === 'student' && (
                <button
                  className="hero-edit-btn"
                  style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
                  onClick={() => navigate('/instructor-register')}
                >
                  📝 Đăng ký làm Giảng viên
                </button>
              )}
            </div>
          </div>

          <div className="hero-avatar-wrapper">
            <div className="hero-rotating-wrap">
              <RotatingBadge
                text={
                  user?.role === 'instructor'
                    ? 'BRAIN BLITZ • GIẢNG VIÊN • '
                    : user?.role === 'admin'
                    ? 'BRAIN BLITZ • QUẢN TRỊ VIÊN • '
                    : 'BRAIN BLITZ • HỌC VIÊN • '
                }
                centerIcon={user?.role === 'instructor' ? '👨‍🏫' : user?.role === 'admin' ? '🛡️' : '🏅'}
                size={130}
              />
            </div>
            <div className="profile-avatar-lg">
              {(isEditing ? avatarUrl : user?.avatar_url) ? (
                <img
                  src={
                    isEditing && avatarUrl.startsWith('blob:')
                      ? avatarUrl
                      : resolveFileUrl((isEditing ? avatarUrl : user?.avatar_url) || '')
                  }
                  alt={user?.full_name}
                />
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
              <span className="stat-value capitalize">
                {user?.role === 'student' ? 'Học viên' : user?.role === 'instructor' ? 'Giảng viên' : user?.role === 'admin' ? 'Quản trị viên' : user?.role}
              </span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Chỉnh sửa thông tin tài khoản</h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => setIsEditing(false)}
              >
                ✕
              </button>
            </div>

            {user?.role === 'instructor' && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <strong style={{ color: '#92400e', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎓</span> Bạn đang có quyền Giảng Viên / Người tạo đề
                  </strong>
                  <p style={{ color: '#78350f', fontSize: '12.5px', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Để cập nhật học vị, đơn vị công tác, chuyên môn, môn học phụ trách và minh chứng chuyên môn, hãy mở Không gian làm việc Giảng viên.
                  </p>
                </div>
                <button
                  type="button"
                  className="save-btn"
                  style={{ background: '#d97706', whiteSpace: 'nowrap', fontSize: '12.5px', padding: '8px 16px' }}
                  onClick={() => navigate('/instructor/profile')}
                >
                  Mở Hồ Sơ Giảng Viên ➔
                </button>
              </div>
            )}

            <form onSubmit={handleUpdate} className="profile-edit-form" style={{ maxWidth: '480px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  Họ và tên <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  required
                  style={{ width: '100%' }}
                />
              </div>

              {/* Chọn & Tải ảnh đại diện */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                  Ảnh đại diện (Avatar)
                </label>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {/* Preview ảnh hiện tại */}
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    title="Bấm để chọn ảnh từ máy tính"
                    style={{
                      position: 'relative',
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      border: (avatarUrl !== initialAvatarUrl || pendingAvatarFile) ? '3px solid #f59e0b' : '3px solid #e5e7eb',
                      boxShadow: (avatarUrl !== initialAvatarUrl || pendingAvatarFile) ? '0 3px 12px rgba(245, 158, 11, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fef3c7',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl.startsWith('blob:') ? avatarUrl : resolveFileUrl(avatarUrl)}
                        alt="Avatar Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#d97706' }}>
                        {fullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>

                  {/* Nút upload file từ máy tính */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="file"
                      ref={avatarInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarFile}
                    />

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="save-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 16px',
                          fontSize: '12.5px',
                          background: '#f59e0b',
                        }}
                        disabled={uploadingAvatar}
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        📁 {uploadingAvatar ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          className="cancel-btn"
                          style={{ padding: '7px 12px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => {
                            if (avatarUrl && avatarUrl.startsWith('blob:')) {
                              URL.revokeObjectURL(avatarUrl);
                            }
                            setPendingAvatarFile(null);
                            setAvatarUrl('');
                          }}
                        >
                          Gỡ ảnh
                        </button>
                      )}

                      {(avatarUrl !== initialAvatarUrl || pendingAvatarFile !== null) && (
                        <button
                          type="button"
                          className="cancel-btn"
                          style={{ padding: '7px 12px', fontSize: '12px', color: '#4b5563', borderColor: '#d1d5db' }}
                          onClick={handleRevertAvatar}
                          title="Khôi phục lại ảnh ban đầu"
                        >
                          ↺ Khôi phục ảnh gốc
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        Định dạng JPG, PNG, WEBP (tối đa 5MB) • Xem trước trước khi lưu
                      </span>

                      {(avatarUrl !== initialAvatarUrl || pendingAvatarFile !== null) && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                        }}>
                          🟡 Đang xem trước (Chưa lưu)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bộ sưu tập ảnh đại diện có sẵn */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
                    Hoặc chọn nhanh ảnh đại diện mẫu:
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = avatarUrl === preset.url;
                      return (
                        <div
                          key={preset.id}
                          title={preset.label}
                          onClick={() => handleSelectPreset(preset.url)}
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: isSelected ? '3px solid #d97706' : '2px solid #e5e7eb',
                            transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                            boxShadow: isSelected ? '0 0 0 2px #fde68a' : 'none',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="edit-actions">
                <button type="submit" disabled={saving} className="save-btn">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    if (avatarUrl && avatarUrl.startsWith('blob:')) {
                      URL.revokeObjectURL(avatarUrl);
                    }
                    setIsEditing(false);
                    setFullName(user?.full_name || '');
                    setAvatarUrl(initialAvatarUrl);
                    setPendingAvatarFile(null);
                  }}
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

      {/* Modal Xem Trước Ảnh Đại Diện */}
      {previewModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={cancelPreviewModal}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#18181b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📷</span> Xem Trước Ảnh Đại Diện
              </h3>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
                onClick={cancelPreviewModal}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '130px',
                  height: '130px',
                  margin: '0 auto 16px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #f59e0b',
                  boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {previewModal.previewUrl && (
                  <img
                    src={previewModal.previewUrl}
                    alt="Preview Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>

              {previewModal.file && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1f2937' }}>
                    {previewModal.file.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
                    Kích thước: {(previewModal.file.size / 1024).toFixed(1)} KB • {previewModal.file.type || 'Hình ảnh'}
                  </div>
                </div>
              )}

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '12.5px',
                  color: '#475569',
                  lineHeight: 1.5,
                  textAlign: 'left',
                }}
              >
                ℹ️ Đây là chế độ <strong>xem trước</strong>. Khi bấm <strong>"Sử dụng ảnh này"</strong>, ảnh sẽ hiển thị thử trên hồ sơ của bạn. Bạn cần bấm <strong>"Lưu thay đổi"</strong> để chính thức cập nhật vào hệ thống.
              </div>
            </div>

            <div
              style={{
                padding: '16px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <button
                type="button"
                className="cancel-btn"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={cancelPreviewModal}
              >
                ✕ Hủy bỏ
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="cancel-btn"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  📁 Chọn ảnh khác
                </button>
                <button
                  type="button"
                  className="save-btn"
                  style={{ background: '#f59e0b', padding: '8px 18px', fontSize: '13px' }}
                  onClick={applyPreviewAvatar}
                >
                  ✓ Sử dụng ảnh này
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;