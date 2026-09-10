import React, { useState, useEffect, useRef } from 'react';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';

interface Subject {
  id: number;
  name: string;
}

interface Props {
  onSuccessRedirect?: () => void;
}

export const InstructorRegisterView: React.FC<Props> = ({ onSuccessRedirect }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    // Học vấn & Đơn vị công tác
    degree: 'Cử nhân Đại học Sư phạm',
    workplace: '',
    experience_years: '3 - 5 năm kinh nghiệm',
    // Chuyên môn & Môn học
    specialization: '',
    bio: '',
    subject_ids: [] as number[],
    // Hồ sơ minh chứng & Đề thi mẫu
    certificate_url: '',
    certificate_name: '',
    sample_exam_url: '',
    sample_exam_name: '',
    // Cam kết
    agreement_profile: true,
    agreement_copyright: true,
    agreement_process: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [uploadingExam, setUploadingExam] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [existingPending, setExistingPending] = useState(false);

  const certInputRef = useRef<HTMLInputElement>(null);
  const examInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSubjects();
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const rawUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (token && rawUser) {
        setIsLoggedIn(true);
        const u = JSON.parse(rawUser);
        setFormData((prev) => ({
          ...prev,
          full_name: u.full_name || '',
          email: u.email || '',
          phone: u.phone || '',
        }));

        // Kiểm tra xem đã có hồ sơ đang chờ duyệt chưa
        try {
          const profRes = await api.get('/instructor/my-profile');
          if (profRes.data?.data?.has_profile && profRes.data.data.profile) {
            const p = profRes.data.data.profile;
            if (p.verify_status === 'pending') {
              setExistingPending(true);
              setFormData((prev) => ({
                ...prev,
                specialization: p.specialization || '',
                degree: p.degree || 'Cử nhân Đại học Sư phạm',
                workplace: p.workplace || '',
                experience_years: p.experience_years || '3 - 5 năm kinh nghiệm',
                certificate_url: p.certificate_url || '',
                sample_exam_url: p.sample_exam_url || '',
                bio: p.bio || '',
                subject_ids: p.subjects ? p.subjects.map((s: Subject) => s.id) : [],
                agreement_profile: true,
                agreement_copyright: true,
                agreement_process: true,
              }));
            }
          }
        } catch {
          // Chưa có profile
        }
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data?.data) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách môn học:', err);
    }
  };

  const handleSubjectToggle = (id: number) => {
    setFormData((prev) => {
      const exists = prev.subject_ids.includes(id);
      return {
        ...prev,
        subject_ids: exists
          ? prev.subject_ids.filter((item) => item !== id)
          : [...prev.subject_ids, id],
      };
    });
  };

  // Upload file bằng cấp / chứng chỉ
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
        const fileUrl = res.data.data.file_url;
        setFormData((prev) => ({
          ...prev,
          certificate_url: fileUrl,
          certificate_name: file.name,
        }));
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

  // Upload file đề thi mẫu
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
        const fileUrl = res.data.data.file_url;
        setFormData((prev) => ({
          ...prev,
          sample_exam_url: fileUrl,
          sample_exam_name: file.name,
        }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Kiểm tra thông tin bắt buộc đối với khách chưa đăng nhập
    if (!isLoggedIn) {
      if (!formData.full_name.trim()) {
        setToast({ type: 'error', message: 'Vui lòng nhập họ và tên giảng viên.' });
        return;
      }
      if (!formData.email.trim()) {
        setToast({ type: 'error', message: 'Vui lòng nhập email liên hệ.' });
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setToast({ type: 'error', message: 'Vui lòng nhập mật khẩu tối thiểu 6 ký tự.' });
        return;
      }
    }

    if (!formData.workplace.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập trường / cơ quan / đơn vị công tác hiện tại.' });
      return;
    }

    if (!formData.specialization.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập chuyên môn phụ trách của bạn.' });
      return;
    }

    if (formData.subject_ids.length === 0) {
      setToast({ type: 'error', message: 'Vui lòng chọn ít nhất 1 môn học phụ trách biên soạn.' });
      return;
    }

    if (!formData.certificate_url.trim()) {
      setToast({ type: 'error', message: 'Vui lòng tải lên hoặc cung cấp liên kết chứng chỉ/bằng cấp chuyên môn.' });
      return;
    }

    if (!formData.sample_exam_url.trim()) {
      setToast({ type: 'error', message: 'Vui lòng tải lên hoặc cung cấp đề thi mẫu minh họa để Hội đồng thẩm định.' });
      return;
    }

    if (!formData.agreement_profile || !formData.agreement_copyright || !formData.agreement_process) {
      setToast({ type: 'error', message: 'Vui lòng đồng ý với toàn bộ các điều khoản cam kết chuyên môn và bản quyền.' });
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        specialization: formData.specialization.trim(),
        degree: formData.degree,
        workplace: formData.workplace.trim(),
        experience_years: formData.experience_years,
        certificate_url: formData.certificate_url.trim(),
        sample_exam_url: formData.sample_exam_url.trim(),
        bio: formData.bio.trim(),
        subject_ids: formData.subject_ids,
      };

      if (formData.phone) payload.phone = formData.phone.trim();

      // Nếu chưa có tài khoản khách thì gửi thêm thông tin tạo tài khoản
      if (!isLoggedIn) {
        payload.email = formData.email.trim();
        payload.full_name = formData.full_name.trim();
        payload.password = formData.password;
      }

      const res = await api.post('/instructor/register', payload);

      if (res.data?.success) {
        setIsSubmitted(true);
        setToast({
          type: 'success',
          message: res.data.message || 'Đăng ký hồ sơ thẩm định giảng viên thành công!',
        });

        // Lưu token và user nếu là khách mới đăng ký
        if (res.data.data?.access_token) {
          localStorage.setItem('token', res.data.data.access_token);
        }
        if (res.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Đăng ký hồ sơ thất bại. Vui lòng kiểm tra lại thông tin.';
      setToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="m2-card" style={{ maxWidth: '760px', margin: '30px auto', textAlign: 'center', padding: '44px 32px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', margin: '0 0 10px 0' }}>
          Hồ Sơ Đã Nộp Thẩm Định Thành Công!
        </h2>

        <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.65', margin: '0 0 24px 0' }}>
          Cảm ơn bạn đã nộp hồ sơ đăng ký trở thành Giảng viên / Người tạo đề tại <strong>Brain Blitz</strong>.
          Hồ sơ học thuật, văn bằng chứng chỉ và đề thi mẫu của bạn đã được chuyển đến Hội Đồng Kiểm Duyệt Chuyên Môn để thẩm định tính xác thực trong thời hạn <strong>≤ 3 ngày làm việc</strong>.
        </p>

        <div style={{ background: '#fffdf7', border: '1px solid #fde68a', borderRadius: '14px', padding: '20px', marginBottom: '24px', textAlign: 'left', fontSize: '14px', color: '#92400e' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Báo cáo tóm tắt hồ sơ thẩm định:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', lineHeight: '1.6' }}>
            <div><strong>Họ và tên:</strong> {formData.full_name}</div>
            <div><strong>Học vị:</strong> {formData.degree}</div>
            <div><strong>Đơn vị:</strong> {formData.workplace}</div>
            <div><strong>Kinh nghiệm:</strong> {formData.experience_years}</div>
            <div><strong>Chuyên môn:</strong> {formData.specialization}</div>
            <div><strong>Môn phụ trách:</strong> {formData.subject_ids.length} môn</div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #fcd34d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#78350f' }}>Mã trạng thái xét duyệt:</span>
            <span className="m2-badge pending">⏳ Đang chờ Hội Đồng Chuyên Môn Thẩm Định</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="m2-btn m2-btn-primary" onClick={() => setIsSubmitted(false)}>
            Xem lại & Điều chỉnh hồ sơ
          </button>
          {onSuccessRedirect && (
            <button className="m2-btn m2-btn-secondary" onClick={onSuccessRedirect}>
              Xem danh sách Giảng viên công khai
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="m2-card" style={{ maxWidth: '880px', margin: '0 auto' }}>
      <div className="m2-card-header">
        <div>
          <h2 className="m2-card-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#d97706">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Quy Trình Kiểm Định & Cấp Quyền Tác Giả Đề Thi
          </h2>
          <p className="m2-card-desc">
            Quy chuẩn kiểm định chuyên nghiệp dành cho Giảng viên, Giáo viên chuyên và Chuyên gia ra đề trắc nghiệm chuẩn quốc gia.
          </p>
        </div>
        <span className="m2-badge pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Hội đồng thẩm định ≤ 3 ngày
        </span>
      </div>

      {/* Lộ trình thẩm định chuẩn */}
      <div className="m2-steps-roadmap">
        <div className="m2-step-item active">
          <div className="m2-step-number">1</div>
          <div>
            <div className="m2-step-title">Kê khai học thuật</div>
            <div className="m2-step-desc">Học vị, trường công tác & số năm kinh nghiệm</div>
          </div>
        </div>
        <div className="m2-step-item active">
          <div className="m2-step-number">2</div>
          <div>
            <div className="m2-step-title">Minh chứng & Đề mẫu</div>
            <div className="m2-step-desc">Tải lên bằng cấp & file đề thi thẩm định</div>
          </div>
        </div>
        <div className="m2-step-item">
          <div className="m2-step-number">3</div>
          <div>
            <div className="m2-step-title">Hội đồng thẩm định</div>
            <div className="m2-step-desc">Đánh giá ma trận & chất lượng biên soạn</div>
          </div>
        </div>
        <div className="m2-step-item">
          <div className="m2-step-number">4</div>
          <div>
            <div className="m2-step-title">Cấp quyền tác giả</div>
            <div className="m2-step-desc">Mở khoá quyền tạo đề thi & ngân hàng câu hỏi</div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`m2-toast m2-toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {isLoggedIn && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '14px 18px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#065f46' }}>
              Tài khoản nộp thẩm định: {formData.full_name} ({formData.email})
            </div>
            <div style={{ fontSize: '12.5px', color: '#047857', marginTop: '2px' }}>
              {existingPending
                ? 'Hồ sơ của bạn đang được Hội đồng chuyên môn kiểm duyệt. Bạn có thể cập nhật tài liệu hoặc bổ sung minh chứng bên dưới.'
                : 'Tài khoản của bạn sẽ tự động được nâng cấp thành Giảng viên / Người tạo đề ngay sau khi hồ sơ được phê duyệt.'}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Phần 1: Thông tin cá nhân & Tài khoản */}
        <div className="m2-section-card">
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#92400e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>1</span>
            Thông Tin Cá Nhân & Tài Khoản Tác Giả
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Họ và tên tác giả / giảng viên <span className="required">*</span>
              </label>
              <input
                type="text"
                className="m2-form-control"
                placeholder="Ví dụ: ThS. Nguyễn Hoàng Nam"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={isLoggedIn}
                required
              />
            </div>

            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Email công tác / liên hệ <span className="required">*</span>
              </label>
              <input
                type="email"
                className="m2-form-control"
                placeholder="nam.nh@truong.edu.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoggedIn}
                required
              />
            </div>

            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">Số điện thoại liên hệ (Zalo nhận thông báo)</label>
              <input
                type="tel"
                className="m2-form-control"
                placeholder="0912 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {!isLoggedIn && (
              <div className="m2-form-group" style={{ margin: 0 }}>
                <label className="m2-form-label">
                  Mật khẩu đăng nhập hệ thống <span className="required">*</span>
                </label>
                <input
                  type="password"
                  className="m2-form-control"
                  placeholder="Tối thiểu 6 ký tự bảo mật"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!isLoggedIn}
                  minLength={6}
                />
              </div>
            )}
          </div>
        </div>

        {/* Phần 2: Trình độ học vấn & Đơn vị công tác */}
        <div className="m2-section-card">
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#92400e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>2</span>
            Trình Độ Học Vấn & Đơn Vị Công Tác
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Học vị / Bằng cấp cao nhất <span className="required">*</span>
              </label>
              <select
                className="m2-form-control"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
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

            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Trường / Đơn vị công tác hiện tại <span className="required">*</span>
              </label>
              <input
                type="text"
                className="m2-form-control"
                placeholder="Ví dụ: THPT Chuyên Hà Nội - Amsterdam / ĐH Sư Phạm HN"
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                required
              />
            </div>

            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Thâm niên giảng dạy & Ra đề trắc nghiệm <span className="required">*</span>
              </label>
              <select
                className="m2-form-control"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
              >
                <option value="Dưới 2 năm kinh nghiệm">Dưới 2 năm kinh nghiệm</option>
                <option value="2 - 5 năm kinh nghiệm">2 - 5 năm kinh nghiệm</option>
                <option value="5 - 10 năm kinh nghiệm">5 - 10 năm kinh nghiệm</option>
                <option value="Trên 10 năm kinh nghiệm">Trên 10 năm kinh nghiệm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Phần 3: Chuyên môn & Môn học phụ trách */}
        <div className="m2-section-card">
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#92400e', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>3</span>
            Chuyên Môn & Môn Học Phụ Trách Biên Soạn
          </h3>

          <div className="m2-form-group">
            <label className="m2-form-label">
              Chuyên ngành & Lĩnh vực đào tạo thế mạnh <span className="required">*</span>
            </label>
            <input
              type="text"
              className="m2-form-control"
              placeholder="Ví dụ: Chuyên đề Hàm số & Hình học Không gian 12 - Luyện thi Đánh giá năng lực & Tốt nghiệp THPT"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>

          <div className="m2-form-group">
            <label className="m2-form-label">
              Môn học phụ trách ra đề thi <span className="required">*</span>
            </label>
            <div className="m2-subjects-checkboxes">
              {subjects.map((sub) => (
                <label key={sub.id} className="m2-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.subject_ids.includes(sub.id)}
                    onChange={() => handleSubjectToggle(sub.id)}
                  />
                  <span>{sub.name}</span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '12.5px', color: '#8a8f9d', margin: '6px 0 0' }}>
              Đã đăng ký: <strong style={{ color: '#d97706' }}>{formData.subject_ids.length}</strong> môn học
            </p>
          </div>

          <div className="m2-form-group" style={{ margin: 0 }}>
            <label className="m2-form-label">Hồ sơ năng lực & Phương pháp giảng dạy (Bio)</label>
            <textarea
              className="m2-form-control"
              rows={3}
              placeholder="Mô tả tóm tắt kinh nghiệm giảng dạy, phương pháp xây dựng câu hỏi phân hóa 4 cấp độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao), các đầu sách/tài liệu ôn thi đã từng phát hành..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Phần 4: Hồ sơ minh chứng & Thẩm định đề mẫu */}
        <div className="m2-section-card" style={{ borderColor: '#fed7aa', background: '#fffcf7' }}>
          <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: '#9a3412', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffedd5', color: '#c2410c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>4</span>
            Hồ Sơ Minh Chứng & Đề Thi Mẫu Thẩm Định
          </h3>
          <p style={{ fontSize: '13px', color: '#7c2d12', margin: '0 0 16px', lineHeight: '1.5' }}>
            Để đảm bảo chất lượng khảo thí nghiêm ngặt của nền tảng, Ban Quản Trị yêu cầu minh chứng bằng cấp và tối thiểu 01 đề thi mẫu (kèm ma trận/đáp án chi tiết) để Hội đồng chuyên môn thẩm định năng lực trước khi cấp quyền.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Văn bằng / Chứng chỉ */}
            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Bằng ĐH Sư Phạm / Chứng chỉ nghiệp vụ <span className="required">*</span>
              </label>

              <input
                type="file"
                ref={certInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleCertUpload}
              />

              <div
                className={`m2-upload-box ${formData.certificate_url ? 'uploaded' : ''}`}
                onClick={() => certInputRef.current?.click()}
              >
                <div style={{ color: formData.certificate_url ? '#059669' : '#d97706', marginBottom: '6px' }}>
                  {formData.certificate_url ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1e24' }}>
                  {uploadingCert
                    ? 'Đang tải file lên máy chủ...'
                    : formData.certificate_url
                    ? '✓ Đã tải minh chứng bằng cấp'
                    : 'Bấm để chọn file Bằng tốt nghiệp / Thẻ GV / Chứng chỉ'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
                  Định dạng PDF, DOCX, JPG, PNG (tối đa 10MB)
                </div>
              </div>

              {formData.certificate_url && (
                <div className="m2-file-preview">
                  <span style={{ fontSize: '12.5px', color: '#065f46', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    📎 {formData.certificate_name || formData.certificate_url}
                  </span>
                  <a
                    href={resolveFileUrl(formData.certificate_url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}
                  >
                    Xem file
                  </a>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="m2-form-control"
                  style={{ fontSize: '12.5px', padding: '8px 12px' }}
                  placeholder="Hoặc dán liên kết Google Drive / OneDrive bằng cấp..."
                  value={formData.certificate_url}
                  onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                />
              </div>
            </div>

            {/* Đề thi mẫu */}
            <div className="m2-form-group" style={{ margin: 0 }}>
              <label className="m2-form-label">
                Đề thi mẫu tự biên soạn kèm ma trận & đáp án <span className="required">*</span>
              </label>

              <input
                type="file"
                ref={examInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleExamUpload}
              />

              <div
                className={`m2-upload-box ${formData.sample_exam_url ? 'uploaded' : ''}`}
                onClick={() => examInputRef.current?.click()}
              >
                <div style={{ color: formData.sample_exam_url ? '#059669' : '#d97706', marginBottom: '6px' }}>
                  {formData.sample_exam_url ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1e24' }}>
                  {uploadingExam
                    ? 'Đang tải đề thi mẫu lên máy chủ...'
                    : formData.sample_exam_url
                    ? '✓ Đã tải đề thi mẫu thẩm định'
                    : 'Bấm để tải file Đề thi minh họa kèm lời giải chi tiết'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
                  Định dạng PDF, DOCX, DOC (tối đa 10MB)
                </div>
              </div>

              {formData.sample_exam_url && (
                <div className="m2-file-preview">
                  <span style={{ fontSize: '12.5px', color: '#065f46', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                    📑 {formData.sample_exam_name || formData.sample_exam_url}
                  </span>
                  <a
                    href={resolveFileUrl(formData.sample_exam_url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}
                  >
                    Xem file
                  </a>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  className="m2-form-control"
                  style={{ fontSize: '12.5px', padding: '8px 12px' }}
                  placeholder="Hoặc dán liên kết Google Docs / Drive đề thi mẫu..."
                  value={formData.sample_exam_url}
                  onChange={(e) => setFormData({ ...formData, sample_exam_url: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phần 5: Cam kết bản quyền & Quy chế biên soạn */}
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px 20px', borderRadius: '14px', marginBottom: '26px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚖️</span> Cam Kết Pháp Lý & Bản Quyền Tác Giả:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="m2-checkbox-label" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={formData.agreement_profile}
                onChange={(e) => setFormData({ ...formData, agreement_profile: e.target.checked })}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.45', color: '#713f12' }}>
                Tôi cam đoan mọi thông tin về văn bằng, chứng chỉ giảng dạy và quá trình công tác kê khai trong hồ sơ là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật.
              </span>
            </label>

            <label className="m2-checkbox-label" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={formData.agreement_copyright}
                onChange={(e) => setFormData({ ...formData, agreement_copyright: e.target.checked })}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.45', color: '#713f12' }}>
                Tôi cam kết toàn bộ đề thi, câu hỏi trắc nghiệm đưa lên hệ thống do tôi tự biên soạn hoặc có quyền sử dụng hợp pháp; không sao chép trái phép hoặc vi phạm bản quyền của tổ chức khác.
              </span>
            </label>

            <label className="m2-checkbox-label" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={formData.agreement_process}
                onChange={(e) => setFormData({ ...formData, agreement_process: e.target.checked })}
                style={{ marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', lineHeight: '1.45', color: '#713f12' }}>
                Tôi đồng ý để Hội đồng chuyên môn của Brain Blitz thẩm định chất lượng đề thi trong thời hạn ≤ 3 ngày làm việc trước khi cấp chứng chỉ và quyền tác giả chính thức.
              </span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="m2-btn m2-btn-primary"
            disabled={loading || uploadingCert || uploadingExam}
            style={{ minWidth: '220px', padding: '13px 26px', fontSize: '15px' }}
          >
            {loading ? 'Đang gửi hồ sơ thẩm định...' : 'Nộp Hồ Sơ Thẩm Định Giảng Viên'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstructorRegisterView;
