import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@onthitracnghiem/shared';
import Sidebar from '../components/Sidebar';
import './AdminUsers.css';

interface AdminUserRow {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'locked' | 'pending';
  deleted_at: string | null;
  created_at: string;
}

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form tạo tài khoản mới
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined },
      });
      setUsers(res.data.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('Bạn không có quyền truy cập trang này');
        navigate('/home');
      }
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, navigate]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300); // debounce khi gõ tìm kiếm
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/admin/users', newUser);
      showMessage('Tạo tài khoản thành công');
      setShowCreateForm(false);
      setNewUser({ full_name: '', email: '', password: '', role: 'student' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      showMessage('Cập nhật vai trò thành công');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleLockToggle = async (user: AdminUserRow) => {
    try {
      if (user.status === 'locked') {
        await api.post(`/admin/users/${user.id}/unlock`);
        showMessage('Đã mở khóa tài khoản');
      } else {
        await api.post(`/admin/users/${user.id}/lock`);
        showMessage('Đã khóa tài khoản');
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa tài khoản này? Bạn có thể khôi phục lại sau.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      showMessage('Đã xóa tài khoản');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/restore`);
      showMessage('Đã khôi phục tài khoản');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Khôi phục thất bại');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>Quản lý tài khoản</h1>
          <button className="admin-add-btn" onClick={() => setShowCreateForm((v) => !v)}>
            {showCreateForm ? 'Hủy' : '+ Thêm tài khoản'}
          </button>
        </div>

        {message && <div className="admin-message">{message}</div>}

        {showCreateForm && (
          <form className="admin-create-form" onSubmit={handleCreateUser}>
            <h3>Tạo tài khoản nội bộ</h3>
            <div className="admin-form-row">
              <input
                placeholder="Họ và tên"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
              />
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="student">Học viên</option>
                <option value="instructor">Giảng viên</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" disabled={creating}>{creating ? 'Đang tạo...' : 'Tạo'}</button>
            </div>
          </form>
        )}

        <div className="admin-filters">
          <input
            className="admin-search"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tất cả vai trò</option>
            <option value="student">Học viên</option>
            <option value="instructor">Giảng viên</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khóa</option>
            <option value="deleted">Đã xóa</option>
          </select>
        </div>

        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading">Đang tải...</div>
          ) : users.length === 0 ? (
            <div className="admin-loading">Không tìm thấy tài khoản nào</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.deleted_at ? 'row-deleted' : ''}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={!!u.deleted_at}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="admin-role-select"
                      >
                        <option value="student">Học viên</option>
                        <option value="instructor">Giảng viên</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${u.deleted_at ? 'deleted' : u.status}`}>
                        {u.deleted_at ? 'Đã xóa' : u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="admin-actions">
                      {u.deleted_at ? (
                        <button className="admin-action-btn restore" onClick={() => handleRestore(u.id)}>
                          Khôi phục
                        </button>
                      ) : (
                        <>
                          <button className="admin-action-btn" onClick={() => handleLockToggle(u)}>
                            {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                          </button>
                          <button className="admin-action-btn danger" onClick={() => handleDelete(u.id)}>
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;