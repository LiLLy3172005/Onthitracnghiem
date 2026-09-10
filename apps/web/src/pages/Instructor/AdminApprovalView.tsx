import React, { useState, useEffect } from 'react';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';

interface Subject {
  id: number;
  name: string;
}

interface PendingProfile {
  id: number;
  user_id: number;
  specialization: string;
  degree?: string;
  workplace?: string;
  experience_years?: string;
  certificate_url?: string;
  sample_exam_url?: string;
  bio: string;
  verify_status: string;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  subjects: Subject[];
}

export const AdminApprovalView: React.FC = () => {
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal từ chối
  const [rejectModalProfile, setRejectModalProfile] = useState<PendingProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  // Modal xem chi tiết thẩm định
  const [viewDetail, setViewDetail] = useState<PendingProfile | null>(null);
  const [checkingSla, setCheckingSla] = useState(false);

  useEffect(() => {
    fetchPendingProfiles();
  }, []);

  const handleCheckSlaOverdue = async () => {
    setCheckingSla(true);
    try {
      const res = await api.post('/admin/instructors/check-overdue');
      if (res.data?.success) {
        setToast({
          type: res.data.data?.expired_count > 0 ? 'error' : 'success',
          message: res.data.message,
        });
        fetchPendingProfiles();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi quét SLA quá hạn.' });
    } finally {
      setCheckingSla(false);
    }
  };

  const getSlaInfo = (createdAtStr: string) => {
    const created = new Date(createdAtStr).getTime();
    const now = Date.now();
    const deadline = created + 3 * 24 * 60 * 60 * 1000; // 3 days SLA
    const remainingMs = deadline - now;
    const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));

    if (remainingMs <= 0) {
      return {
        label: '⚠️ Quá hạn 3 ngày',
        subText: 'Quá hạn cam kết SLA',
        style: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' },
      };
    } else if (remainingHours <= 24) {
      return {
        label: `⏱️ Còn ${Math.max(1, remainingHours)} giờ`,
        subText: 'Cần ưu tiên xử lý',
        style: { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' },
      };
    } else {
      return {
        label: `⏱️ Còn ${remainingDays} ngày`,
        subText: `Hạn: ${new Date(deadline).toLocaleDateString('vi-VN')}`,
        style: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
      };
    }
  };

  const fetchPendingProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/instructors', {
        params: { verify_status: 'pending' },
      });
      if (res.data?.data?.instructors) {
        setProfiles(res.data.data.instructors);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách chờ duyệt:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (p: PendingProfile) => {
    if (!window.confirm(`Xác nhận phê duyệt hồ sơ tác giả [${p.user.full_name}]?\nSau khi duyệt, tài khoản sẽ được cấp chứng chỉ tác giả và quyền Giảng viên biên soạn đề thi.`)) {
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post(`/admin/instructors/${p.id}/approve`);
      if (res.data?.success) {
        setToast({ type: 'success', message: `Đã phê duyệt thành công hồ sơ của [${p.user.full_name}].` });
        fetchPendingProfiles();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi phê duyệt hồ sơ.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalProfile) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post(`/admin/instructors/${rejectModalProfile.id}/reject`, {
        reject_reason: rejectReason.trim(),
      });
      if (res.data?.success) {
        setToast({ type: 'success', message: `Đã từ chối hồ sơ của [${rejectModalProfile.user.full_name}].` });
        setRejectModalProfile(null);
        setRejectReason('');
        fetchPendingProfiles();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi từ chối hồ sơ.' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {/* Thanh tiêu đề & Công cụ kiểm duyệt chuẩn SaaS */}
      <div className="m2-admin-toolbar-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-flex', padding: '6px', borderRadius: '8px', background: '#fffbeb', color: '#d97706' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              Hội Đồng Thẩm Định & Kiểm Duyệt Hồ Sơ Tác GiẢ / Giảng Viên
            </h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
              Thẩm định học vị, đơn vị công tác, bằng cấp chuyên môn và thẩm định chất lượng đề thi mẫu trong thời hạn <strong>≤ 3 ngày làm việc</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {profiles.length} hồ sơ chờ thẩm định
            </span>

            <button
              type="button"
              className="m2-admin-btn-filter"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
              }}
              disabled={checkingSla}
              onClick={handleCheckSlaOverdue}
              title="Quét và tự động từ chối các hồ sơ đã nộp quá 3 ngày làm việc theo quy chuẩn SLA"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {checkingSla ? 'Đang quét...' : '⚡ Quét SLA 3 ngày'}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`m2-toast m2-toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {loading ? (
        <div className="m2-empty-state" style={{ padding: '48px 20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div>Đang tải hồ sơ chờ duyệt...</div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="m2-admin-table-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '16px' }}>Tất cả hồ sơ đã được xử lý xong!</h3>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>Hiện tại không có hồ sơ giảng viên nào đang chờ phê duyệt.</p>
        </div>
      ) : (
        <div className="m2-admin-table-card">
          <div className="m2-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="m2-table">
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>Tác giả / Giảng viên</th>
                <th style={{ minWidth: '150px' }}>Học vị & Đơn vị công tác</th>
                <th style={{ minWidth: '160px' }}>Chuyên môn & Môn thi</th>
                <th style={{ minWidth: '130px' }}>Tài liệu thẩm định</th>
                <th style={{ minWidth: '130px' }}>Hạn duyệt SLA (≤ 3 ngày)</th>
                <th className="m2-table-sticky-actions" style={{ textAlign: 'center', minWidth: '220px' }}>
                  Thao tác & Quyết định
                </th>
              </tr>
            </thead>
            <tbody>
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.user.avatar_url ? (
                          <img
                            src={resolveFileUrl(p.user.avatar_url)}
                            alt={p.user.full_name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #f1f5f9',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #059669, #10b981)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '15px',
                              boxShadow: '0 2px 5px rgba(5,150,105,0.2)',
                              flexShrink: 0,
                            }}
                          >
                            {p.user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>{p.user.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{p.user.email}</span>
                            {p.user.phone && (
                              <>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span>{p.user.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            marginBottom: '4px',
                          }}
                        >
                          🎓 {p.degree || 'Cử nhân Sư phạm'}
                        </span>
                        <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                          🏢 {p.workplace || 'Chưa cập nhật'}
                        </div>
                        {p.experience_years && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#fef3c7',
                              color: '#92400e',
                              marginTop: '3px',
                              display: 'inline-block',
                            }}
                          >
                            ⏱️ {p.experience_years}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155', lineHeight: '1.4', marginBottom: '4px' }}>
                        {p.specialization}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxWidth: '220px' }}>
                        {p.subjects && p.subjects.length > 0 ? (
                          p.subjects.map((s) => (
                            <span
                              key={s.id}
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 500,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #dbeafe',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Chưa chọn môn</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {p.certificate_url ? (
                          <a
                            href={resolveFileUrl(p.certificate_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '12px',
                              color: '#2563eb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              background: '#eff6ff',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #dbeafe',
                              width: 'fit-content',
                            }}
                          >
                            📎 Bằng cấp / CC
                          </a>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#9ca3af' }}>Chưa có minh chứng</span>
                        )}

                        {p.sample_exam_url ? (
                          <a
                            href={resolveFileUrl(p.sample_exam_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '12px',
                              color: '#b45309',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              background: '#fffbeb',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fde68a',
                              width: 'fit-content',
                            }}
                          >
                            📑 Đề thi mẫu
                          </a>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#9ca3af' }}>Chưa có đề mẫu</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('vi-VN')} {new Date(p.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {(() => {
                        const sla = getSlaInfo(p.created_at);
                        return (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              marginTop: '4px',
                              whiteSpace: 'nowrap',
                              ...sla.style,
                            }}
                            title={sla.subText}
                          >
                            {sla.label}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="m2-table-sticky-actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="m2-btn m2-btn-secondary m2-btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 11px',
                            fontSize: '12px',
                            borderColor: '#cbd5e1',
                            fontWeight: 600,
                            borderRadius: '8px',
                            background: '#ffffff',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewDetail(p);
                          }}
                          title="Xem chi tiết toàn bộ bằng cấp và đề thi mẫu thẩm định"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Thẩm định
                        </button>

                        <button
                          className="m2-btn m2-btn-success m2-btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            background: '#10b981',
                            borderColor: '#059669',
                          }}
                          disabled={processing}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(p);
                          }}
                          title="Phê duyệt và cấp quyền Giảng viên"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Duyệt
                        </button>

                        <button
                          className="m2-btn m2-btn-danger m2-btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 11px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '8px',
                          }}
                          disabled={processing}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRejectModalProfile(p);
                            setRejectReason('');
                          }}
                          title="Từ chối hồ sơ này"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="m2-admin-table-footer">
          <div>
            Đang chờ xử lý: <strong>{profiles.length}</strong> hồ sơ giảng viên
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            ⏱️ Cam kết SLA ≤ 3 ngày làm việc | Tự động cập nhật thời gian thực
          </div>
        </div>
      </div>
      )}

      {/* Modal xem chi tiết thẩm định hồ sơ nộp */}
      {viewDetail && (
        <div className="m2-modal-overlay" onClick={() => setViewDetail(null)}>
          <div className="m2-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="m2-modal-header">
              <h3 className="m2-modal-title">Hồ Sơ Thẩm Định Tác Giả #{viewDetail.id}</h3>
              <button className="m2-modal-close" onClick={() => setViewDetail(null)}>
                &times;
              </button>
            </div>
            <div className="m2-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {/* Thông tin ứng viên */}
              <div style={{ background: '#faf8f5', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Họ tên giảng viên</label>
                  <strong style={{ fontSize: '14.5px', color: '#1e1e24' }}>{viewDetail.user.full_name}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Email liên hệ</label>
                  <strong style={{ fontSize: '13.5px', color: '#1e1e24' }}>{viewDetail.user.email}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Số điện thoại (Zalo)</label>
                  <span>{viewDetail.user.phone || 'Chưa cung cấp'}</span>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Hạn cam kết thẩm định SLA</label>
                  {(() => {
                    const sla = getSlaInfo(viewDetail.created_at);
                    return (
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', display: 'inline-block', ...sla.style }}>
                        {sla.label} • {sla.subText}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Trình độ học thuật */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#166534', fontWeight: 700 }}>
                  🎓 Trình Độ Học Vấn & Công Tác:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div><strong>Học vị cao nhất:</strong> {viewDetail.degree || 'Chưa kê khai'}</div>
                  <div><strong>Kinh nghiệm:</strong> {viewDetail.experience_years || 'Chưa kê khai'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Đơn vị công tác:</strong> {viewDetail.workplace || 'Chưa kê khai'}</div>
                </div>
              </div>

              <div className="m2-form-group">
                <label className="m2-form-label">Lĩnh vực chuyên môn & Thế mạnh ra đề:</label>
                <div style={{ background: '#fcfaf7', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0eae1', fontSize: '13.5px' }}>
                  {viewDetail.specialization}
                </div>
              </div>

              <div className="m2-form-group">
                <label className="m2-form-label">Môn học đăng ký phụ trách:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {viewDetail.subjects && viewDetail.subjects.length > 0 ? (
                    viewDetail.subjects.map((s) => (
                      <span key={s.id} className="m2-tag-chip">
                        <span className="m2-tag-dot" />
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>Chưa chọn môn</span>
                  )}
                </div>
              </div>

              {/* Tài liệu thẩm định: Bằng cấp & Đề mẫu */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '13.5px', color: '#92400e', fontWeight: 700 }}>
                  📑 Hồ Sơ Minh Chứng & Đề Thi Mẫu Thẩm Định:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1e24' }}>Bằng Cấp / Chứng Chỉ Nghiệp Vụ</div>
                      <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Văn bằng xác thực tư cách chuyên môn sư phạm</div>
                    </div>
                    {viewDetail.certificate_url ? (
                      <a
                        href={resolveFileUrl(viewDetail.certificate_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="m2-btn m2-btn-secondary m2-btn-sm"
                        style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
                      >
                        🔍 Mở Xem Bằng Cấp
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#dc2626' }}>Chưa có file</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1e24' }}>Đề Thi Mẫu Tự Biên Soạn</div>
                      <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Đề thi kèm ma trận & giải chi tiết để thẩm định chất lượng</div>
                    </div>
                    {viewDetail.sample_exam_url ? (
                      <a
                        href={resolveFileUrl(viewDetail.sample_exam_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="m2-btn m2-btn-secondary m2-btn-sm"
                        style={{ color: '#d97706', borderColor: '#fde68a' }}
                      >
                        🔍 Thẩm Định Đề Mẫu
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#dc2626' }}>Chưa có file</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="m2-form-group" style={{ margin: 0 }}>
                <label className="m2-form-label">Tiểu sử & Kinh nghiệm sư phạm:</label>
                <div style={{ background: '#fcfaf7', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f0eae1', fontSize: '13px', lineHeight: '1.5' }}>
                  {viewDetail.bio || 'Chưa có thông tin bổ sung.'}
                </div>
              </div>
            </div>
            <div className="m2-modal-footer">
              <button className="m2-btn m2-btn-secondary" onClick={() => setViewDetail(null)}>
                Đóng
              </button>
              <button
                className="m2-btn m2-btn-danger"
                onClick={() => {
                  const target = viewDetail;
                  setViewDetail(null);
                  setRejectModalProfile(target);
                  setRejectReason('');
                }}
              >
                ✕ Từ chối hồ sơ
              </button>
              <button
                className="m2-btn m2-btn-success"
                onClick={() => {
                  setViewDetail(null);
                  handleApprove(viewDetail);
                }}
              >
                ✓ Duyệt & Cấp Quyền Tác Giả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nhập lý do từ chối hồ sơ */}
      {rejectModalProfile && (
        <div className="m2-modal-overlay" onClick={() => setRejectModalProfile(null)}>
          <div className="m2-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="m2-modal-header">
              <h3 className="m2-modal-title" style={{ color: '#b91c1c' }}>
                Từ Chối Hồ Sơ Giảng Viên
              </h3>
              <button className="m2-modal-close" onClick={() => setRejectModalProfile(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleRejectSubmit}>
              <div className="m2-modal-body">
                <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#4b5563' }}>
                  Bạn đang từ chối hồ sơ của giảng viên <strong>{rejectModalProfile.user.full_name}</strong>. Vui lòng ghi rõ lý do để người đăng ký biết và bổ sung:
                </p>

                <div className="m2-form-group">
                  <label className="m2-form-label">
                    Lý do từ chối <span className="required">*</span>
                  </label>
                  <textarea
                    className="m2-form-control"
                    placeholder="Ví dụ: Thiếu chứng chỉ sư phạm hoặc minh chứng kinh nghiệm giảng dạy; môn học đăng ký chưa khớp với chuyên ngành..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </div>
              <div className="m2-modal-footer">
                <button
                  type="button"
                  className="m2-btn m2-btn-secondary"
                  onClick={() => setRejectModalProfile(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="m2-btn m2-btn-danger" disabled={processing}>
                  {processing ? 'Đang gửi...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

