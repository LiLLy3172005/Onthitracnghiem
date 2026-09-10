import React, { useState, useEffect, useRef } from 'react';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';
import { PRESET_AVATARS } from '../Auth/Profile';

interface Subject {
  id: number;
  name: string;
}

interface ProfileData {
  id: number;
  user_id: number;
  specialization: string;
  degree?: string;
  workplace?: string;
  experience_years?: string;
  certificate_url?: string;
  sample_exam_url?: string;
  bio: string;
  verify_status: 'pending' | 'approved' | 'rejected';
  reject_reason?: string;
  verified_at?: string;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    role: string;
    status: string;
  };
  subjects: Subject[];
}

export const InstructorProfileView: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [degree, setDegree] = useState('Cử nhân Đại học Sư phạm');
  const [workplace, setWorkplace] = useState('');
  const [experienceYears, setExperienceYears] = useState('3 - 5 năm kinh nghiệm');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [sampleExamUrl, setSampleExamUrl] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Vui lòng chọn file hình ảnh (JPG, PNG, WEBP, GIF)' });
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
    setToast({
      type: 'success',
      message: 'Đã cập nhật ảnh xem trước. Nhấn "Lưu Thay Đổi Thông Tin" để lưu chính thức.',
    });
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
    setToast({ type: 'success', message: 'Đã khôi phục lại ảnh đại diện ban đầu.' });
  };

  const handleSelectPreset = (url: string) => {
    if (avatarUrl && avatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(avatarUrl);
    }
    setPendingAvatarFile(null);
    setAvatarUrl(url);
  };

  const certInputRef = useRef<HTMLInputElement>(null);
  const examInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingExam, setUploadingExam] = useState(false);

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Dung lượng file tối đa 10MB.' });
      return;
    }

    setUploadingCert(true);
    setToast(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/instructor/upload-evidence', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setCertificateUrl(res.data.data.file_url);
        setToast({ type: 'success', message: 'Tải lên bằng cấp/chứng chỉ thành công!' });
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi tải file chứng chỉ.',
      });
    } finally {
      setUploadingCert(false);
    }
  };

  const handleExamUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Dung lượng file tối đa 10MB.' });
      return;
    }

    setUploadingExam(true);
    setToast(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/instructor/upload-evidence', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setSampleExamUrl(res.data.data.file_url);
        setToast({ type: 'success', message: 'Tải lên đề thi mẫu thẩm định thành công!' });
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi tải file đề thi mẫu.',
      });
    } finally {
      setUploadingExam(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Lấy danh sách môn học
      const subRes = await api.get('/subjects');
      if (subRes.data?.data) {
        setSubjectsList(subRes.data.data);
      }

      // 2. Lấy hồ sơ giảng viên hiện tại
      const profRes = await api.get('/instructor/my-profile');
      if (profRes.data?.data?.has_profile && profRes.data.data.profile) {
        const p = profRes.data.data.profile;
        setProfile(p);
        setFullName(p.user?.full_name || '');
        setPhone(p.user?.phone || '');
        const currentAvatar = p.user?.avatar_url || '';
        setAvatarUrl(currentAvatar);
        setInitialAvatarUrl(currentAvatar);
        setPendingAvatarFile(null);
        setSpecialization(p.specialization || '');
        setDegree(p.degree || 'Cử nhân Đại học Sư phạm');
        setWorkplace(p.workplace || '');
        setExperienceYears(p.experience_years || '3 - 5 năm kinh nghiệm');
        setCertificateUrl(p.certificate_url || '');
        setSampleExamUrl(p.sample_exam_url || '');
        setBio(p.bio || '');
        setSelectedSubjectIds(p.subjects ? p.subjects.map((s: Subject) => s.id) : []);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (id: number) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setSaving(true);

    try {
      let finalAvatarUrl = avatarUrl;

      // Nếu người dùng đã chọn ảnh mới từ máy tính, tải lên server tại đây trước khi lưu
      if (pendingAvatarFile) {
        setUploadingAvatar(true);
        try {
          const formData = new FormData();
          formData.append('avatar', pendingAvatarFile);
          const uploadRes = await api.post('/user/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data?.avatar_url) {
            finalAvatarUrl = uploadRes.data.avatar_url;
            setInitialAvatarUrl(finalAvatarUrl);
            setPendingAvatarFile(null);
          }
        } catch (uploadErr: any) {
          setToast({
            type: 'error',
            message: uploadErr.response?.data?.message || 'Không thể tải ảnh đại diện lên máy chủ.',
          });
          setSaving(false);
          setUploadingAvatar(false);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      const payload = {
        full_name: fullName,
        phone,
        avatar_url: finalAvatarUrl,
        specialization,
        degree,
        workplace,
        experience_years: experienceYears,
        certificate_url: certificateUrl,
        sample_exam_url: sampleExamUrl,
        bio,
        subject_ids: selectedSubjectIds,
      };

      const res = await api.put('/instructor/my-profile', payload);
      if (res.data?.success) {
        // Cập nhật ngay lập tức vào localStorage để Header (InstructorNav) và toàn bộ ứng dụng đồng bộ tức thì
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          try {
            const userObj = JSON.parse(rawUser);
            userObj.full_name = fullName;
            userObj.avatar_url = finalAvatarUrl;
            userObj.phone = phone;
            localStorage.setItem('user', JSON.stringify(userObj));
            window.dispatchEvent(new CustomEvent('user_updated', { detail: userObj }));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            console.error('Error syncing localStorage', e);
          }
        }
        setInitialAvatarUrl(finalAvatarUrl);
        setPendingAvatarFile(null);
        setToast({ type: 'success', message: 'Cập nhật hồ sơ giảng viên và ảnh đại diện thành công!' });
        loadData();
      }
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Không thể lưu thông tin hồ sơ.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="m2-card m2-empty-state">
        <p>Đang tải thông tin giảng viên...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="m2-card" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: '#1e1e24' }}>Bạn chưa có hồ sơ Giảng viên</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          Tài khoản của bạn hiện tại chưa được cấp quyền Giảng viên biên soạn đề. Vui lòng gửi hồ sơ đăng ký để được Ban Quản Trị xét duyệt trong ≤ 3 ngày làm việc.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <a href="/instructor-register" className="m2-btn m2-btn-primary">
            Đăng ký làm Giảng viên ngay
          </a>
          <a href="/login" className="m2-btn m2-btn-secondary">
            Đăng nhập tài khoản khác
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="m2-card" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="m2-card-header">
        <div>
          <h2 className="m2-card-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#d97706">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Quản Lý & Chỉnh Sửa Hồ Sơ Giảng Viên
          </h2>
          <p className="m2-card-desc">
            Cập nhật tên, ảnh đại diện, chuyên môn giảng dạy, tiểu sử và các môn học bạn phụ trách biên soạn.
          </p>
        </div>

        {profile && (
          <span className={`m2-badge ${profile.verify_status}`}>
            {profile.verify_status === 'approved' && 'Giảng viên chính thức'}
            {profile.verify_status === 'pending' && 'Đang chờ xét duyệt'}
            {profile.verify_status === 'rejected' && 'Bị từ chối duyệt'}
          </span>
        )}
      </div>

      {profile?.verify_status === 'rejected' && (
        <div className="m2-toast m2-toast-error">
          <div>
            <strong>Lý do từ chối từ Ban Quản Trị: </strong>
            {profile.reject_reason || 'Vui lòng bổ sung minh chứng chuyên môn và cập nhật lại hồ sơ.'}
          </div>
        </div>
      )}

      {toast && (
        <div className={`m2-toast m2-toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Banner tóm tắt thông tin */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#fdf8f0', border: '1px solid #fae8c8', padding: '18px 22px', borderRadius: '16px', marginBottom: '24px' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl.startsWith('blob:') ? avatarUrl : resolveFileUrl(avatarUrl)}
              alt={fullName}
              className="m2-avatar"
              style={{ width: '72px', height: '72px', objectFit: 'cover' }}
            />
          ) : (
            <div className="m2-avatar-placeholder" style={{ width: '72px', height: '72px', fontSize: '26px' }}>
              {(fullName || 'G').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800, color: '#1e1e24' }}>
              {fullName || 'Chưa đặt họ tên'}
            </h3>
            <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#d97706', fontWeight: 600 }}>
              {specialization || 'Chưa cập nhật chuyên môn'}
            </p>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Email: {profile?.user?.email} • Trạng thái: {profile?.user?.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
            </span>
          </div>
        </div>

        {/* Thông tin cá nhân */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="m2-form-group">
            <label className="m2-form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              className="m2-form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="m2-form-group">
            <label className="m2-form-label">Số điện thoại liên hệ</label>
            <input
              type="tel"
              className="m2-form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Chọn & Tải ảnh đại diện */}
          <div className="m2-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="m2-form-label">Ảnh đại diện Giảng viên (Avatar)</label>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div
                onClick={() => avatarInputRef.current?.click()}
                title="Bấm để chọn ảnh từ máy tính"
                style={{
                  position: 'relative',
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: (avatarUrl !== initialAvatarUrl || pendingAvatarFile) ? '3px solid #f59e0b' : '3px solid #e5e7eb',
                  boxShadow: (avatarUrl !== initialAvatarUrl || pendingAvatarFile) ? '0 3px 12px rgba(245, 158, 11, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
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
                    {fullName?.charAt(0).toUpperCase() || 'G'}
                  </span>
                )}
              </div>

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
                    className="m2-btn m2-btn-primary m2-btn-sm"
                    style={{ background: '#f59e0b', borderColor: '#f59e0b', fontSize: '13px', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={uploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <span>📁</span> Tải ảnh từ máy tính
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      className="m2-btn m2-btn-secondary m2-btn-sm"
                      style={{ padding: '7px 12px', fontSize: '12px', color: '#dc2626' }}
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
                      className="m2-btn m2-btn-secondary m2-btn-sm"
                      style={{ padding: '7px 12px', fontSize: '12px', color: '#4b5563', borderColor: '#d1d5db' }}
                      onClick={handleRevertAvatar}
                      title="Khôi phục lại ảnh ban đầu chưa lưu"
                    >
                      ↺ Khôi phục ảnh gốc
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
                    Định dạng JPG, PNG, WEBP (tối đa 5MB) • Có cửa sổ xem trước
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
                      🟡 Đang xem trước (Chưa lưu vào hệ thống)
                    </span>
                  )}
                </div>
              </div>
            </div>

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
                        width: '40px',
                        height: '40px',
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
        </div>

        {/* Trình độ học vấn & Công tác */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="m2-form-group">
            <label className="m2-form-label">Học vị / Bằng cấp cao nhất</label>
            <select
              className="m2-form-control"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            >
              <option value="Cử nhân Đại học Sư phạm">Cử nhân Đại học Sư phạm</option>
              <option value="Cử nhân Khoa học Tự nhiên / Xã hội">Cử nhân Khoa học Tự nhiên / Xã hội</option>
              <option value="Thạc sĩ (Master of Education / Science)">Thạc sĩ (Master of Education / Science)</option>
              <option value="Tiến sĩ (PhD)">Tiến sĩ (PhD)</option>
              <option value="Giáo viên THPT Chuyên / Dạy giỏi">Giáo viên THPT Chuyên / Dạy giỏi</option>
              <option value="Giảng viên Đại học / Cao đẳng">Giảng viên Đại học / Cao đẳng</option>
              <option value="Chuyên gia luyện thi độc lập">Chuyên gia luyện thi độc lập (&gt;5 năm)</option>
            </select>
          </div>

          <div className="m2-form-group">
            <label className="m2-form-label">Trường / Đơn vị công tác hiện tại</label>
            <input
              type="text"
              className="m2-form-control"
              placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
            />
          </div>

          <div className="m2-form-group">
            <label className="m2-form-label">Thâm niên giảng dạy & Ra đề</label>
            <select
              className="m2-form-control"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            >
              <option value="Dưới 2 năm kinh nghiệm">Dưới 2 năm kinh nghiệm</option>
              <option value="2 - 5 năm kinh nghiệm">2 - 5 năm kinh nghiệm</option>
              <option value="5 - 10 năm kinh nghiệm">5 - 10 năm kinh nghiệm</option>
              <option value="Trên 10 năm kinh nghiệm">Trên 10 năm kinh nghiệm</option>
            </select>
          </div>
        </div>

        {/* Chuyên môn & Môn học */}
        <div className="m2-form-group">
          <label className="m2-form-label">
            Chức danh & Chuyên môn phụ trách <span className="required">*</span>
          </label>
          <input
            type="text"
            className="m2-form-control"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            required
          />
        </div>

        {/* Tài liệu thẩm định / Minh chứng */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
          {/* Bằng cấp / Chứng chỉ */}
          <div className="m2-form-group">
            <label className="m2-form-label">Bằng tốt nghiệp / Chứng chỉ chuyên môn</label>
            <input
              type="file"
              ref={certInputRef}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleCertUpload}
            />

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: certificateUrl ? '#065f46' : '#64748b' }}>
                  {certificateUrl ? '✓ Đã có tài liệu chứng chỉ' : 'Chưa có file chứng chỉ'}
                </span>
                {certificateUrl && (
                  <a
                    href={resolveFileUrl(certificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}
                  >
                    🔍 Xem file
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="m2-btn m2-btn-secondary m2-btn-sm"
                  style={{ flex: 1, fontSize: '12.5px', padding: '7px 12px' }}
                  disabled={uploadingCert}
                  onClick={() => certInputRef.current?.click()}
                >
                  📁 {uploadingCert ? 'Đang tải lên...' : certificateUrl ? 'Tải file khác thay thế' : 'Tải file từ máy tính'}
                </button>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Định dạng PDF, DOCX, JPG, PNG (tối đa 10MB)
              </span>
            </div>
          </div>

          {/* Đề thi mẫu */}
          <div className="m2-form-group">
            <label className="m2-form-label">Đề thi mẫu thẩm định</label>
            <input
              type="file"
              ref={examInputRef}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleExamUpload}
            />

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: sampleExamUrl ? '#065f46' : '#64748b' }}>
                  {sampleExamUrl ? '✓ Đã có đề thi mẫu' : 'Chưa có file đề thi mẫu'}
                </span>
                {sampleExamUrl && (
                  <a
                    href={resolveFileUrl(sampleExamUrl)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, textDecoration: 'none' }}
                  >
                    🔍 Xem đề thi
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="m2-btn m2-btn-secondary m2-btn-sm"
                  style={{ flex: 1, fontSize: '12.5px', padding: '7px 12px' }}
                  disabled={uploadingExam}
                  onClick={() => examInputRef.current?.click()}
                >
                  📁 {uploadingExam ? 'Đang tải lên...' : sampleExamUrl ? 'Tải file khác thay thế' : 'Tải đề thi từ máy tính'}
                </button>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Định dạng PDF, DOCX, DOC (tối đa 10MB)
              </span>
            </div>
          </div>
        </div>

        <div className="m2-form-group">
          <label className="m2-form-label">Môn học phụ trách biên soạn đề:</label>
          <div className="m2-subjects-checkboxes">
            {subjectsList.map((sub) => (
              <label key={sub.id} className="m2-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedSubjectIds.includes(sub.id)}
                  onChange={() => handleSubjectToggle(sub.id)}
                />
                <span>{sub.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="m2-form-group">
          <label className="m2-form-label">Tiểu sử & Giới thiệu bản thân:</label>
          <textarea
            className="m2-form-control"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="submit" className="m2-btn m2-btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Thông Tin'}
          </button>
        </div>
      </form>

      {/* Modal Xem Trước Ảnh Đại Diện */}
      {previewModal.isOpen && (
        <div className="m2-modal-overlay" onClick={cancelPreviewModal} style={{ zIndex: 1100 }}>
          <div
            className="m2-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="m2-modal-header">
              <h3 className="m2-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📷</span> Xem Trước Ảnh Đại Diện
              </h3>
              <button type="button" className="m2-modal-close" onClick={cancelPreviewModal}>
                ✕
              </button>
            </div>

            <div className="m2-modal-body" style={{ padding: '24px 20px', textAlign: 'center' }}>
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
                ℹ️ Đây là chế độ <strong>xem trước</strong>. Khi bấm <strong>"Sử dụng ảnh này"</strong>, ảnh sẽ hiển thị thử trên hồ sơ của bạn. Bạn cần bấm <strong>"Lưu Thay Đổi Thông Tin"</strong> ở cuối trang để chính thức lưu vào hệ thống.
              </div>
            </div>

            <div className="m2-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <button
                type="button"
                className="m2-btn m2-btn-secondary"
                onClick={cancelPreviewModal}
              >
                ✕ Hủy bỏ
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="m2-btn m2-btn-secondary"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  📁 Chọn ảnh khác
                </button>
                <button
                  type="button"
                  className="m2-btn m2-btn-primary"
                  style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#ffffff' }}
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
