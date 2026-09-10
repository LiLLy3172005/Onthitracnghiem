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
  bio: string;
  verify_status: string;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
    status: string;
  };
  subjects: Subject[];
}

interface Props {
  onRegisterClick: () => void;
}

export const PublicInstructorView: React.FC<Props> = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchInstructors();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      if (res.data?.data) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục môn học:', err);
    }
  };

  const fetchInstructors = async (searchTerm = search, subjectId = selectedSubject) => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (subjectId !== 'all') params.subject_id = subjectId;

      const res = await api.get('/instructors/public', { params });
      if (res.data?.data) {
        setInstructors(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách giảng viên:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchInstructors(val, selectedSubject);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedSubject(val);
    fetchInstructors(search, val);
  };

  return (
    <div>

      {/* Thanh lọc & tìm kiếm */}
      <div className="m2-filter-row">
        <div className="m2-search-input-wrap">
          <svg className="m2-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="m2-input"
            placeholder="Tìm theo tên giảng viên, chuyên môn..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <select className="m2-select" value={selectedSubject} onChange={handleSubjectChange}>
          <option value="all">Tất cả môn học ({subjects.length})</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid danh sách giảng viên */}
      {loading ? (
        <div className="m2-empty-state">
          <p>Đang tải danh sách giảng viên uy tín...</p>
        </div>
      ) : instructors.length === 0 ? (
        <div className="m2-card m2-empty-state">
          <svg className="m2-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e1e24' }}>Không tìm thấy giảng viên phù hợp</h3>
          <p style={{ margin: 0, fontSize: '13.5px' }}>Thử tìm kiếm với từ khóa khác hoặc chọn môn học khác nhé!</p>
        </div>
      ) : (
        <div className="m2-instructor-grid">
          {instructors.map((inst) => (
            <div key={inst.id} className="m2-instructor-card">
              <div className="m2-card-top-profile">
                <div className="m2-avatar-wrap">
                  {inst.user.avatar_url ? (
                    <img src={resolveFileUrl(inst.user.avatar_url)} alt={inst.user.full_name} className="m2-avatar" />
                  ) : (
                    <div className="m2-avatar-placeholder">
                      {inst.user.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="m2-card-top-info">
                  <h3 className="m2-inst-name" title={inst.user.full_name}>{inst.user.full_name}</h3>
                  <p className="m2-inst-spec" title={`${inst.degree ? `${inst.degree} • ` : ''}${inst.specialization}`}>
                    {inst.degree ? `${inst.degree} • ` : ''}{inst.specialization}
                  </p>
                  <p className="m2-inst-workplace" title={inst.workplace || ''}>
                    {inst.workplace ? `🏫 ${inst.workplace}` : ''}
                  </p>
                </div>
              </div>

              <p className="m2-inst-bio">{inst.bio || 'Chưa có mô tả tiểu sử giảng viên.'}</p>

              <div className="m2-tags-group">
                {inst.subjects && inst.subjects.length > 0 ? (
                  inst.subjects.map((s) => (
                    <span key={s.id} className="m2-tag-chip">
                      <span className="m2-tag-dot" />
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="m2-tag-chip">Chưa phân môn</span>
                )}
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f1ece4' }}>
                <span className="m2-badge approved">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Đã xác minh
                </span>
                <button
                  className="m2-btn m2-btn-secondary m2-btn-sm"
                  onClick={() => setSelectedInstructor(inst)}
                >
                  Xem hồ sơ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết giảng viên công khai */}
      {selectedInstructor && (
        <div className="m2-modal-overlay" onClick={() => setSelectedInstructor(null)}>
          <div className="m2-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="m2-modal-header">
              <h3 className="m2-modal-title">Hồ Sơ Giảng Viên Brain Blitz</h3>
              <button className="m2-modal-close" onClick={() => setSelectedInstructor(null)}>
                &times;
              </button>
            </div>
            <div className="m2-modal-body">
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                {selectedInstructor.user.avatar_url ? (
                  <img
                    src={resolveFileUrl(selectedInstructor.user.avatar_url)}
                    alt={selectedInstructor.user.full_name}
                    className="m2-avatar"
                    style={{ width: '76px', height: '76px', minWidth: '76px', minHeight: '76px', maxWidth: '76px', maxHeight: '76px', flexShrink: 0, aspectRatio: '1/1' }}
                  />
                ) : (
                  <div className="m2-avatar-placeholder" style={{ width: '76px', height: '76px', minWidth: '76px', minHeight: '76px', maxWidth: '76px', maxHeight: '76px', flexShrink: 0, aspectRatio: '1/1', fontSize: '28px' }}>
                    {selectedInstructor.user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800 }}>
                    {selectedInstructor.user.full_name}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13.5px', color: '#d97706', fontWeight: 600 }}>
                    {selectedInstructor.specialization}
                  </p>
                  <span className="m2-badge approved">
                    ✓ Giảng viên chính thức đã duyệt
                  </span>
                </div>
              </div>

              {(selectedInstructor.degree || selectedInstructor.workplace || selectedInstructor.experience_years) && (
                <div style={{ background: '#fdfaf5', border: '1px solid #f1ece4', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selectedInstructor.degree && (
                    <div><strong>Học vị:</strong> {selectedInstructor.degree}</div>
                  )}
                  {selectedInstructor.experience_years && (
                    <div><strong>Kinh nghiệm:</strong> {selectedInstructor.experience_years}</div>
                  )}
                  {selectedInstructor.workplace && (
                    <div style={{ gridColumn: '1 / -1' }}><strong>Đơn vị:</strong> {selectedInstructor.workplace}</div>
                  )}
                </div>
              )}

              <div className="m2-form-group">
                <label className="m2-form-label">Môn học phụ trách:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedInstructor.subjects.map((sub) => (
                    <span key={sub.id} className="m2-tag-chip" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}>
                      {sub.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="m2-form-group">
                <label className="m2-form-label">Giới thiệu & Kinh nghiệm:</label>
                <div style={{ background: '#fcfaf7', padding: '14px', borderRadius: '12px', border: '1px solid #f0eae1', fontSize: '14px', lineHeight: '1.6', color: '#374151' }}>
                  {selectedInstructor.bio || 'Chưa có thông tin bổ sung.'}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Hồ sơ đã được xác thực danh tính và chuyên môn bởi Ban Quản Trị hệ thống.</span>
              </div>
            </div>
            <div className="m2-modal-footer">
              <button className="m2-btn m2-btn-secondary" onClick={() => setSelectedInstructor(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
