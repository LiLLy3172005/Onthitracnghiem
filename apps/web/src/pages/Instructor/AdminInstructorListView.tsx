import React, { useState, useEffect } from 'react';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';

interface Subject {
  id: number;
  name: string;
}

interface Instructor {
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
    status: 'active' | 'locked' | 'pending';
    role: string;
    avatar_url?: string;
  };
  subjects: Subject[];
}

export const AdminInstructorListView: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    locked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('all');
  const [userStatus, setUserStatus] = useState('all');
  const [subjectId, setSubjectId] = useState('all');

  // Modal chi tiết
  const [viewDetail, setViewDetail] = useState<Instructor | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchData();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data?.data) {
        setSubjects(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async (override?: { search?: string; verify_status?: string; user_status?: string; subject_id?: string }) => {
    setLoading(true);
    try {
      const vStatus = override?.verify_status !== undefined ? override.verify_status : verifyStatus;
      const uStatus = override?.user_status !== undefined ? override.user_status : userStatus;
      const sId = override?.subject_id !== undefined ? override.subject_id : subjectId;
      const sText = override?.search !== undefined ? override.search : search;

      const params: any = {};
      if (sText) params.search = sText;
      if (vStatus !== 'all') params.verify_status = vStatus;
      if (uStatus !== 'all') params.user_status = uStatus;
      if (sId !== 'all') params.subject_id = sId;

      const res = await api.get('/admin/instructors', { params });
      if (res.data?.data) {
        setInstructors(res.data.data.instructors || []);
        if (res.data.data.counts) {
          setCounts(res.data.data.counts);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (vStatus: string, uStatus: string) => {
    // Nếu đang chọn chính bộ lọc này rồi thì bấm lại để bỏ lọc (về all)
    if (vStatus !== 'all' && verifyStatus === vStatus && userStatus === 'all') {
      setVerifyStatus('all');
      fetchData({ verify_status: 'all', user_status: 'all' });
      return;
    }
    if (uStatus !== 'all' && userStatus === uStatus && verifyStatus === 'all') {
      setUserStatus('all');
      fetchData({ verify_status: 'all', user_status: 'all' });
      return;
    }

    setVerifyStatus(vStatus);
    setUserStatus(uStatus);
    fetchData({ verify_status: vStatus, user_status: uStatus });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setVerifyStatus('all');
    setUserStatus('all');
    setSubjectId('all');
    fetchData({ search: '', verify_status: 'all', user_status: 'all', subject_id: 'all' });
  };

  const isFiltered = search.trim() !== '' || verifyStatus !== 'all' || userStatus !== 'all' || subjectId !== 'all';

  const isTotalActive = verifyStatus === 'all' && userStatus === 'all';
  const isPendingActive = verifyStatus === 'pending' && userStatus === 'all';
  const isApprovedActive = verifyStatus === 'approved' && userStatus === 'all';
  const isLockedActive = userStatus === 'locked';

  const handleToggleStatus = async (inst: Instructor) => {
    const isLocked = inst.user.status === 'locked';
    const action = isLocked ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản giảng viên [${inst.user.full_name}]?`)) {
      return;
    }

    try {
      const res = await api.post(`/admin/instructors/${inst.id}/toggle-status`);
      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message });
        fetchData();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi thao tác trạng thái.' });
    }
  };

  const handleDelete = async (inst: Instructor) => {
    if (!window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn gỡ bỏ hoàn toàn hồ sơ giảng viên [${inst.user.full_name}]?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/instructors/${inst.id}`);
      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message });
        fetchData();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi gỡ bỏ hồ sơ.' });
    }
  };

  return (
    <div>
      {/* Thẻ thống kê tổng quan 4 ô hiện đại - Có liên kết lọc tức thì khi bấm */}
      <div className="m2-admin-stats-grid">
        <div
          className={`m2-admin-stat-card total ${isTotalActive ? 'active' : ''}`}
          onClick={() => handleStatClick('all', 'all')}
          title="Bấm để xem tất cả hồ sơ giảng viên"
        >
          <div className="m2-admin-stat-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="m2-admin-stat-label" style={{ margin: 0 }}>Tổng hồ sơ</span>
              {isTotalActive && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#e0e7ff', color: '#4338ca' }}>
                  Đang chọn
                </span>
              )}
            </div>
            <div className="m2-admin-stat-num">{counts.total}</div>
          </div>
          <div className="m2-admin-stat-icon-wrap total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>

        <div
          className={`m2-admin-stat-card pending ${isPendingActive ? 'active' : ''}`}
          onClick={() => handleStatClick('pending', 'all')}
          title="Bấm để lọc nhanh: Các hồ sơ đang chờ xét duyệt"
        >
          <div className="m2-admin-stat-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="m2-admin-stat-label" style={{ color: '#d97706', margin: 0 }}>Chờ xét duyệt</span>
              {isPendingActive && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309' }}>
                  Đang lọc ✓
                </span>
              )}
            </div>
            <div className="m2-admin-stat-num" style={{ color: '#d97706' }}>{counts.pending}</div>
          </div>
          <div className="m2-admin-stat-icon-wrap pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        <div
          className={`m2-admin-stat-card approved ${isApprovedActive ? 'active' : ''}`}
          onClick={() => handleStatClick('approved', 'all')}
          title="Bấm để lọc nhanh: Các hồ sơ đã phê duyệt"
        >
          <div className="m2-admin-stat-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="m2-admin-stat-label" style={{ color: '#059669', margin: 0 }}>Đã phê duyệt</span>
              {isApprovedActive && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#d1fae5', color: '#065f46' }}>
                  Đang lọc ✓
                </span>
              )}
            </div>
            <div className="m2-admin-stat-num" style={{ color: '#059669' }}>{counts.approved}</div>
          </div>
          <div className="m2-admin-stat-icon-wrap approved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        </div>

        <div
          className={`m2-admin-stat-card locked ${isLockedActive ? 'active' : ''}`}
          onClick={() => handleStatClick('all', 'locked')}
          title="Bấm để lọc nhanh: Các tài khoản đang bị khóa"
        >
          <div className="m2-admin-stat-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span className="m2-admin-stat-label" style={{ color: '#dc2626', margin: 0 }}>Tài khoản bị khóa</span>
              {isLockedActive && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c' }}>
                  Đang lọc ✓
                </span>
              )}
            </div>
            <div className="m2-admin-stat-num" style={{ color: '#dc2626' }}>{counts.locked}</div>
          </div>
          <div className="m2-admin-stat-icon-wrap locked">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`m2-toast m2-toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Thanh lọc & tìm kiếm chuẩn Admin Toolbar */}
      <div className="m2-admin-toolbar-card">
        <form onSubmit={handleSearchSubmit} className="m2-admin-filter-form">
          <div className="m2-admin-search-wrap">
            <svg className="m2-admin-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="m2-admin-search-input"
              placeholder="Tìm theo tên, email, số điện thoại, chuyên môn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="m2-admin-select"
            value={verifyStatus}
            onChange={(e) => {
              const val = e.target.value;
              setVerifyStatus(val);
              fetchData({ verify_status: val });
            }}
          >
            <option value="all">Trạng thái duyệt: Tất cả</option>
            <option value="pending">Chờ xét duyệt</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="rejected">Bị từ chối</option>
          </select>

          <select
            className="m2-admin-select"
            value={userStatus}
            onChange={(e) => {
              const val = e.target.value;
              setUserStatus(val);
              fetchData({ user_status: val });
            }}
          >
            <option value="all">Trạng thái TK: Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Bị khóa</option>
          </select>

          <select
            className="m2-admin-select"
            value={subjectId}
            onChange={(e) => {
              const val = e.target.value;
              setSubjectId(val);
              fetchData({ subject_id: val });
            }}
          >
            <option value="all">Tất cả môn phụ trách</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button type="submit" className="m2-admin-btn-filter">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Lọc dữ liệu
          </button>

          {isFiltered && (
            <button
              type="button"
              className="m2-admin-btn-reset"
              onClick={handleResetFilters}
              title="Khôi phục bộ lọc mặc định"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Đặt lại
            </button>
          )}
        </form>
      </div>

      {/* Bảng danh sách giảng viên */}
      <div className="m2-admin-table-card">
        {loading ? (
          <div className="m2-empty-state" style={{ padding: '48px 20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div>Đang tải danh sách giảng viên...</div>
          </div>
        ) : instructors.length === 0 ? (
          <div className="m2-empty-state" style={{ padding: '48px 20px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Không tìm thấy giảng viên phù hợp</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Thử thay đổi từ khóa hoặc điều kiện bộ lọc bên trên.</div>
          </div>
        ) : (
          <div className="m2-table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="m2-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '240px' }}>Giảng viên</th>
                  <th style={{ minWidth: '200px' }}>Chuyên môn & Học vị</th>
                  <th style={{ minWidth: '170px' }}>Môn học phụ trách</th>
                  <th style={{ minWidth: '130px' }}>Kiểm duyệt</th>
                  <th style={{ minWidth: '120px' }}>Tài khoản</th>
                  <th className="m2-table-sticky-actions" style={{ textAlign: 'center', minWidth: '180px' }}>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((inst) => (
                  <tr key={inst.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {inst.user.avatar_url ? (
                          <img
                            src={resolveFileUrl(inst.user.avatar_url)}
                            alt={inst.user.full_name}
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
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '15px',
                              boxShadow: '0 2px 5px rgba(37,99,235,0.2)',
                              flexShrink: 0,
                            }}
                          >
                            {inst.user.full_name?.charAt(0).toUpperCase() || 'G'}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>
                            {inst.user.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{inst.user.email}</span>
                            {inst.user.phone && (
                              <>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span>{inst.user.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {inst.degree && (
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
                            🎓 {inst.degree}
                          </span>
                        )}
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155', lineHeight: '1.4' }}>
                          {inst.specialization}
                        </div>
                        {inst.workplace && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                            🏢 {inst.workplace}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxWidth: '220px' }}>
                        {inst.subjects && inst.subjects.length > 0 ? (
                          inst.subjects.map((s) => (
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
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Chưa phân công</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...(inst.verify_status === 'approved'
                            ? { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }
                            : inst.verify_status === 'pending'
                            ? { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }
                            : { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }),
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background:
                              inst.verify_status === 'approved'
                                ? '#10b981'
                                : inst.verify_status === 'pending'
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        />
                        {inst.verify_status === 'approved' && 'Đã phê duyệt'}
                        {inst.verify_status === 'pending' && 'Chờ xét duyệt'}
                        {inst.verify_status === 'rejected' && 'Từ chối'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          ...(inst.user.status === 'active'
                            ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                            : { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }),
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: inst.user.status === 'active' ? '#22c55e' : '#ef4444',
                            boxShadow:
                              inst.user.status === 'active'
                                ? '0 0 0 2px rgba(34, 197, 94, 0.2)'
                                : '0 0 0 2px rgba(239, 68, 68, 0.2)',
                          }}
                        />
                        {inst.user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="m2-table-sticky-actions" style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {/* Chi tiết */}
                        <button
                          type="button"
                          onClick={() => setViewDetail(inst)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#94a3b8';
                            e.currentTarget.style.color = '#0f172a';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#334155';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Chi tiết
                        </button>

                        {/* Khóa / Mở khóa */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(inst)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            ...(inst.user.status === 'active'
                              ? { background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }
                              : { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669' }),
                          }}
                          onMouseEnter={(e) => {
                            if (inst.user.status === 'active') {
                              e.currentTarget.style.background = '#ffe4e6';
                              e.currentTarget.style.borderColor = '#fda4af';
                            } else {
                              e.currentTarget.style.background = '#d1fae5';
                              e.currentTarget.style.borderColor = '#6ee7b7';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (inst.user.status === 'active') {
                              e.currentTarget.style.background = '#fff1f2';
                              e.currentTarget.style.borderColor = '#fecdd3';
                            } else {
                              e.currentTarget.style.background = '#ecfdf5';
                              e.currentTarget.style.borderColor = '#a7f3d0';
                            }
                          }}
                        >
                          {inst.user.status === 'active' ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              Khóa
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                              </svg>
                              Mở khóa
                            </>
                          )}
                        </button>

                        {/* Xóa */}
                        <button
                          type="button"
                          onClick={() => handleDelete(inst)}
                          title="Gỡ bỏ hồ sơ"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.borderColor = '#fecaca';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = '#94a3b8';
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer tóm tắt dữ liệu bảng */}
        <div className="m2-admin-table-footer">
          <div>
            Hiển thị <strong>{instructors.length}</strong> giảng viên
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <span>💡 Nhấn "Chi tiết" để xem toàn bộ bằng cấp và đề thi mẫu</span>
          </div>
        </div>
      </div>

      {/* Modal xem chi tiết */}
      {viewDetail && (
        <div className="m2-modal-overlay" onClick={() => setViewDetail(null)}>
          <div className="m2-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="m2-modal-header">
              <h3 className="m2-modal-title">Chi Tiết Hồ Sơ Giảng Viên #{viewDetail.id}</h3>
              <button className="m2-modal-close" onClick={() => setViewDetail(null)}>
                &times;
              </button>
            </div>
            <div className="m2-modal-body">
              {/* Thông tin cá nhân & Tài khoản */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fdf8f0', border: '1px solid #fae8c8', padding: '14px 18px', borderRadius: '12px', marginBottom: '16px' }}>
                {viewDetail.user.avatar_url ? (
                  <img
                    src={resolveFileUrl(viewDetail.user.avatar_url)}
                    alt={viewDetail.user.full_name}
                    className="m2-avatar"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="m2-avatar-placeholder" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                    {viewDetail.user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e1e24' }}>
                      {viewDetail.user.full_name}
                    </h4>
                    <span className={`m2-badge ${viewDetail.verify_status}`}>
                      {viewDetail.verify_status === 'approved' && 'Giảng viên chính thức'}
                      {viewDetail.verify_status === 'pending' && 'Chờ duyệt'}
                      {viewDetail.verify_status === 'rejected' && 'Bị từ chối'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px' }}>
                    Email: {viewDetail.user.email} • SĐT: {viewDetail.user.phone || 'Chưa cung cấp'}
                  </div>
                </div>
              </div>

              {/* Trình độ học vấn & Đơn vị công tác */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#166534', fontWeight: 700 }}>
                  🎓 Trình Độ Học Vấn & Đơn Vị Công Tác:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                  <div><strong>Học vị:</strong> {viewDetail.degree || 'Chưa cập nhật'}</div>
                  <div><strong>Kinh nghiệm:</strong> {viewDetail.experience_years || 'Chưa cập nhật'}</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong>Đơn vị công tác:</strong> {viewDetail.workplace || 'Chưa cập nhật'}</div>
                </div>
              </div>

              <div className="m2-form-group">
                <label className="m2-form-label">Chuyên môn:</label>
                <div style={{ background: '#fcfaf7', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0eae1', fontSize: '13px' }}>
                  {viewDetail.specialization}
                </div>
              </div>

              <div className="m2-form-group">
                <label className="m2-form-label">Môn học phụ trách:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {viewDetail.subjects && viewDetail.subjects.length > 0 ? (
                    viewDetail.subjects.map((s) => (
                      <span key={s.id} className="m2-tag-chip">
                        <span className="m2-tag-dot" />
                        {s.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>Chưa chọn môn</span>
                  )}
                </div>
              </div>

              {/* Hồ sơ minh chứng & Đề thi mẫu */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#92400e', fontWeight: 700 }}>
                  📑 Hồ Sơ Minh Chứng & Đề Mẫu:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Bằng cấp / Chứng chỉ nghiệp vụ</div>
                    {viewDetail.certificate_url ? (
                      <a
                        href={resolveFileUrl(viewDetail.certificate_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="m2-btn m2-btn-secondary m2-btn-sm"
                        style={{ color: '#2563eb', borderColor: '#bfdbfe', fontSize: '12px', padding: '4px 10px' }}
                      >
                        🔍 Xem file
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Chưa đính kèm file</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Đề thi mẫu thẩm định</div>
                    {viewDetail.sample_exam_url ? (
                      <a
                        href={resolveFileUrl(viewDetail.sample_exam_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="m2-btn m2-btn-secondary m2-btn-sm"
                        style={{ color: '#d97706', borderColor: '#fde68a', fontSize: '12px', padding: '4px 10px' }}
                      >
                        🔍 Xem file
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Chưa đính kèm file</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="m2-form-group">
                <label className="m2-form-label">Tiểu sử & Giới thiệu:</label>
                <div style={{ background: '#fcfaf7', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f0eae1', fontSize: '13px', lineHeight: '1.5' }}>
                  {viewDetail.bio || 'Chưa có thông tin giới thiệu.'}
                </div>
              </div>

              {viewDetail.reject_reason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 14px', borderRadius: '10px', color: '#991b1b', fontSize: '13px' }}>
                  <strong>Lý do từ chối: </strong>
                  {viewDetail.reject_reason}
                </div>
              )}
            </div>
            <div className="m2-modal-footer">
              <button className="m2-btn m2-btn-secondary" onClick={() => setViewDetail(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
