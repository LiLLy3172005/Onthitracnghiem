import React, { useState, useEffect } from 'react';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';

interface Collaborator {
  id: number;
  owner_instructor_id: number;
  member_user_id: number;
  permission: 'view' | 'edit' | 'approve';
  created_at: string;
  member_user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
}

export const CollaboratorView: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal thêm cộng tác viên
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [permissionInput, setPermissionInput] = useState<'view' | 'edit' | 'approve'>('edit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const res = await api.get('/instructor/collaborators');
      if (res.data?.data) {
        setCollaborators(res.data.data);
      } else {
        setCollaborators([]);
      }
    } catch {
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    setSubmitting(true);

    try {
      const res = await api.post('/instructor/collaborators', {
        email: emailInput.trim(),
        permission: permissionInput,
      });

      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Thêm cộng tác viên thành công!' });
        setShowAddModal(false);
        setEmailInput('');
        fetchCollaborators();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Không thể thêm cộng tác viên.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePermission = async (id: number, newPerm: 'view' | 'edit' | 'approve') => {
    try {
      const res = await api.put(`/instructor/collaborators/${id}`, { permission: newPerm });
      if (res.data?.success) {
        setToast({ type: 'success', message: 'Cập nhật quyền cộng tác viên thành công.' });
        fetchCollaborators();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi cập nhật quyền.' });
    }
  };

  const handleRemove = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ thành viên [${name}] khỏi nhóm cộng tác?`)) return;

    try {
      const res = await api.delete(`/instructor/collaborators/${id}`);
      if (res.data?.success) {
        setToast({ type: 'success', message: res.data.message || 'Đã gỡ cộng tác viên.' });
        fetchCollaborators();
      }
    } catch (err: any) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi gỡ thành viên.' });
    }
  };

  return (
    <div className="m2-card" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="m2-card-header">
        <div>
          <h2 className="m2-card-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#d97706">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Quản Lý Quyền Cộng Tác Biên Soạn Đề
          </h2>
          <p className="m2-card-desc">
            Phân quyền cho các trợ giảng hoặc giáo viên cùng biên soạn, chỉnh sửa hoặc kiểm duyệt câu hỏi trong bộ đề của bạn.
          </p>
        </div>

        <button className="m2-btn m2-btn-primary" onClick={() => setShowAddModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm Cộng Tác Viên
        </button>
      </div>

      {toast && (
        <div className={`m2-toast m2-toast-${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Danh sách phân quyền */}
      {loading ? (
        <div className="m2-empty-state">Đang tải danh sách cộng tác viên...</div>
      ) : collaborators.length === 0 ? (
        <div className="m2-empty-state">
          <svg className="m2-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <h4 style={{ margin: '0 0 6px 0', color: '#1e1e24' }}>Chưa có cộng tác viên nào trong nhóm</h4>
          <p style={{ margin: 0, fontSize: '13.5px' }}>Bấm "Thêm Cộng Tác Viên" để mời người cùng hỗ trợ soạn đề thi!</p>
        </div>
      ) : (
        <div className="m2-table-wrap">
          <table className="m2-table">
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Email tài khoản</th>
                <th>Quyền hạn biên soạn</th>
                <th>Ngày tham gia</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {collaborators.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {c.member_user?.avatar_url ? (
                        <img
                          src={resolveFileUrl(c.member_user.avatar_url)}
                          alt={c.member_user.full_name}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#fef3c7',
                            color: '#b45309',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}
                        >
                          {c.member_user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <strong>{c.member_user?.full_name}</strong>
                    </div>
                  </td>
                  <td>{c.member_user?.email}</td>
                  <td>
                    <select
                      className="m2-select"
                      style={{ padding: '6px 10px', fontSize: '13px' }}
                      value={c.permission}
                      onChange={(e) =>
                        handleUpdatePermission(c.id, e.target.value as 'view' | 'edit' | 'approve')
                      }
                    >
                      <option value="view">Chỉ xem câu hỏi (View)</option>
                      <option value="edit">Biên soạn câu hỏi (Edit)</option>
                      <option value="approve">Kiểm duyệt đề (Approve)</option>
                    </select>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: '12.5px' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : 'Mới tham gia'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="m2-btn m2-btn-danger m2-btn-sm"
                      onClick={() => handleRemove(c.id, c.member_user?.full_name)}
                    >
                      Gỡ quyền
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm Cộng Tác Viên */}
      {showAddModal && (
        <div className="m2-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="m2-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="m2-modal-header">
              <h3 className="m2-modal-title">Mời Cộng Tác Viên Biên Soạn</h3>
              <button className="m2-modal-close" onClick={() => setShowAddModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCollaborator}>
              <div className="m2-modal-body">
                <div className="m2-form-group">
                  <label className="m2-form-label">
                    Email tài khoản của thành viên <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="m2-form-control"
                    placeholder="vidu: lan.nguyen@brainblitz.vn"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                  <p style={{ fontSize: '12px', color: '#8b8f9e', margin: '4px 0 0' }}>
                    Thành viên phải đã có tài khoản trên hệ thống Brain Blitz.
                  </p>
                </div>

                <div className="m2-form-group">
                  <label className="m2-form-label">Phân quyền thao tác:</label>
                  <select
                    className="m2-form-control"
                    value={permissionInput}
                    onChange={(e) =>
                      setPermissionInput(e.target.value as 'view' | 'edit' | 'approve')
                    }
                  >
                    <option value="view">Chỉ xem (View) — Xem ngân hàng câu hỏi & đề thi nội bộ</option>
                    <option value="edit">Biên soạn (Edit) — Soạn câu hỏi mới, chỉnh sửa đáp án</option>
                    <option value="approve">Kiểm duyệt (Approve) — Phê duyệt câu hỏi trước khi xuất bản</option>
                  </select>
                </div>
              </div>
              <div className="m2-modal-footer">
                <button
                  type="button"
                  className="m2-btn m2-btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="m2-btn m2-btn-primary" disabled={submitting}>
                  {submitting ? 'Đang thêm...' : 'Xác nhận phân quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
