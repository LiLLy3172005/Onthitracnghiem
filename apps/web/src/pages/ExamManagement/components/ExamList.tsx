import React from 'react';
import type { Exam, ExamFilter, ExamStats, Subject } from '../types';

interface ExamListProps {
  exams: Exam[];
  stats: ExamStats;
  filter: ExamFilter;
  subjects: Subject[];
  loading?: boolean;
  onFilterChange: (newFilter: Partial<ExamFilter>) => void;
  onCreateNew: () => void;
  onOpenAutoGenerate: () => void;
  onEditExam: (exam: Exam) => void;
  onViewHistory: (exam: Exam) => void;
  onOpenStatusModal: (exam: Exam) => void;
  onOpenDeleteModal: (exam: Exam) => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  exams,
  stats,
  filter,
  subjects,
  loading = false,
  onFilterChange,
  onCreateNew,
  onOpenAutoGenerate,
  onEditExam,
  onViewHistory,
  onOpenStatusModal,
  onOpenDeleteModal,
}) => {
  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { label: 'Dễ', class: 'easy' };
      case 'medium':
        return { label: 'Trung bình', class: 'medium' };
      case 'hard':
        return { label: 'Khó', class: 'hard' };
      case 'mixed':
      default:
        return { label: 'Tổng hợp', class: 'mixed' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { label: 'Đã xuất bản', class: 'published' };
      case 'archived':
        return { label: 'Lưu trữ / Ẩn', class: 'archived' };
      case 'draft':
      default:
        return { label: 'Bản nháp', class: 'draft' };
    }
  };

  return (
    <div>
      {/* 4 Stat Metric Cards */}
      <div className="exam-stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Tổng số đề thi</div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-sub">↑ 4 đề mới tháng này</div>
          </div>
          <div className="stat-icon">📚</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Đã xuất bản (Công khai)</div>
            <div className="stat-val" style={{ color: '#16a34a' }}>{stats.published}</div>
            <div className="stat-sub">Sinh viên đang truy cập làm</div>
          </div>
          <div className="stat-icon emerald">🟢</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Bản nháp (Đang soạn)</div>
            <div className="stat-val" style={{ color: '#d97706' }}>{stats.draft}</div>
            <div className="stat-sub amber">Chưa phát hành</div>
          </div>
          <div className="stat-icon amber">📝</div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Lưu trữ / Ẩn</div>
            <div className="stat-val" style={{ color: '#64748b' }}>{stats.archived}</div>
            <div className="stat-sub slate">Ngừng làm bài</div>
          </div>
          <div className="stat-icon slate">📦</div>
        </div>
      </div>

      {/* Filter Bar & Quick Actions */}
      <div className="exam-filter-bar">
        <div className="filter-left-group">
          {/* Search */}
          <div className="search-input-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm tên đề thi, mã đề..."
              value={filter.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>

          {/* Subject filter */}
          <select
            className="filter-select"
            value={filter.subject_id}
            onChange={(e) => onFilterChange({ subject_id: e.target.value })}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="filter-select"
            value={filter.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="">Mọi trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ / Ẩn</option>
          </select>

          {/* Difficulty filter */}
          <select
            className="filter-select"
            value={filter.difficulty}
            onChange={(e) => onFilterChange({ difficulty: e.target.value })}
          >
            <option value="">Mọi độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
            <option value="mixed">Tổng hợp (Mixed)</option>
          </select>
        </div>

        <div className="filter-right-group" style={{ display: 'flex', gap: '8px' }}>
          <button className="action-quick-btn outline" onClick={onOpenAutoGenerate}>
            <span>⚡</span> Sinh đề tự động
          </button>
          <button className="action-quick-btn gold" onClick={onCreateNew}>
            <span>+</span> Tạo đề thi mới
          </button>
        </div>
      </div>

      {/* Table of Exams */}
      <div className="exam-table-card">
        <div className="exam-table-responsive">
          <table className="exam-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Tên đề thi / Mã đề</th>
                <th>Môn học</th>
                <th style={{ textAlign: 'center' }}>Số câu</th>
                <th style={{ textAlign: 'center' }}>Thời gian</th>
                <th style={{ textAlign: 'center' }}>Độ khó</th>
                <th style={{ textAlign: 'center' }}>Cách tính điểm</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    ⏳ Đang tải danh sách đề thi...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                    Không tìm thấy đề thi phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => {
                  const diffInfo = getDifficultyLabel(exam.difficulty);
                  const statusInfo = getStatusBadge(exam.status);
                  const isArchived = exam.status === 'archived';

                  return (
                    <tr key={exam.id} style={{ opacity: isArchived ? 0.8 : 1 }}>
                      <td className="exam-title-cell">
                        <div
                          className="exam-name"
                          style={{ textDecoration: isArchived ? 'line-through' : 'none' }}
                        >
                          {exam.title}
                          {exam.code && <span className="exam-code-tag">{exam.code}</span>}
                        </div>
                        <div className="exam-sub-info">
                          {exam.is_auto_generated && 'Sinh tự động bởi AI · '}
                          Cập nhật: {exam.updated_at || 'Mới'}
                          {exam.creator && ` bởi ${exam.creator.full_name}`}
                          {exam.revisions_count ? ` · ${exam.revisions_count} lần sửa` : ''}
                        </div>
                      </td>

                      <td style={{ fontWeight: 600, color: '#374151' }}>
                        {exam.subject?.name || 'Chung'}
                      </td>

                      <td style={{ textAlign: 'center', fontWeight: 700 }}>
                        {exam.total_questions} câu
                      </td>

                      <td style={{ textAlign: 'center', fontWeight: 500, color: '#4b5563' }}>
                        {exam.duration_minutes} phút
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className={`diff-tag ${diffInfo.class}`}>{diffInfo.label}</span>
                      </td>

                      <td style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                        {exam.scoring_method === 'weighted' ? 'Trọng số riêng' : 'Điểm bằng nhau (10đ)'}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`status-pill ${statusInfo.class}`}
                          onClick={() => onOpenStatusModal(exam)}
                          title="Bấm để cập nhật trạng thái"
                        >
                          <span className="status-dot" />
                          {statusInfo.label}
                          <span style={{ fontSize: '9px', marginLeft: '2px' }}>▼</span>
                        </button>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions">
                          <button
                            className="icon-btn"
                            title="Chỉnh sửa thông tin đề"
                            onClick={() => onEditExam(exam)}
                          >
                            ✏️
                          </button>
                          <button
                            className="icon-btn"
                            title="Xem lịch sử chỉnh sửa (Audit Log)"
                            onClick={() => onViewHistory(exam)}
                          >
                            🕒
                          </button>
                          <button
                            className="icon-btn danger"
                            title="Xóa hoặc đóng đề thi"
                            onClick={() => onOpenDeleteModal(exam)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & pagination */}
        <div className="table-footer">
          <div>
            Hiển thị <strong>{exams.length}</strong> / {stats.total} đề thi
          </div>
          <div className="pagination-group">
            <button className="page-btn" disabled>‹ Trước</button>
            <button className="page-btn is-active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">Sau ›</button>
          </div>
        </div>
      </div>
    </div>
  );
};
