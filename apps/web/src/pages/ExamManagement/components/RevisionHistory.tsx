import React from 'react';
import type { Exam, ExamRevision } from '../types';

interface RevisionHistoryProps {
  exam: Exam | null;
  revisions: ExamRevision[];
  onBack: () => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({ exam, revisions, onBack }) => {
  if (!exam) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Exam info card */}
      <div className="editor-card" style={{ marginBottom: 24 }}>
        <div className="editor-card-header">📋 Thông tin đề thi</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
          <div>
            <span style={{ color: '#9ca3af', fontSize: 11 }}>TÊN ĐỀ THI</span>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{exam.title}</div>
          </div>
          {exam.code && (
            <div>
              <span style={{ color: '#9ca3af', fontSize: 11 }}>MÃ ĐỀ</span>
              <div style={{ fontWeight: 700, marginTop: 2, fontFamily: 'monospace', color: '#2563eb' }}>{exam.code}</div>
            </div>
          )}
          <div>
            <span style={{ color: '#9ca3af', fontSize: 11 }}>MÔN HỌC</span>
            <div style={{ fontWeight: 600, marginTop: 2 }}>{exam.subject?.name ?? `Môn #${exam.subject_id}`}</div>
          </div>
          <div>
            <span style={{ color: '#9ca3af', fontSize: 11 }}>TRẠNG THÁI HIỆN TẠI</span>
            <div style={{ marginTop: 2 }}>
              <span className={`status-pill ${exam.status}`} style={{ cursor: 'default' }}>
                <span className="status-dot" />
                {exam.status === 'published' ? 'Đã xuất bản' : exam.status === 'draft' ? 'Bản nháp' : 'Lưu trữ / Ẩn'}
              </span>
            </div>
          </div>
          <div>
            <span style={{ color: '#9ca3af', fontSize: 11 }}>TỔNG SỐ LẦN SỬA</span>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{revisions.length} lần</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="editor-card">
        <div className="editor-card-header">🕒 Lịch sử chỉnh sửa (Audit Trail)</div>

        {revisions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
            Chưa có lịch sử chỉnh sửa nào.
          </div>
        ) : (
          <div className="timeline-container">
            {revisions.map((rev, i) => (
              <div key={rev.id} className="timeline-item">
                <div className={`timeline-dot ${i > 0 ? 'gray' : ''}`} />
                <div className="timeline-card">
                  <div className="timeline-header">
                    <div className="timeline-version-title">
                      <span>Phiên bản v{revisions.length - i}</span>
                      {i === 0 && (
                        <span style={{
                          fontSize: 10,
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}>MỚI NHẤT</span>
                      )}
                    </div>
                    <span className="timeline-date">{formatDate(rev.created_at)}</span>
                  </div>

                  <div className="timeline-author">
                    👤 {rev.changed_by_user?.full_name ?? `Người dùng #${rev.changed_by}`}
                    {rev.changed_by_user?.role && (
                      <span style={{ color: '#9ca3af', marginLeft: 4 }}>· {rev.changed_by_user.role}</span>
                    )}
                  </div>

                  <div className="timeline-note-box">
                    {rev.change_note ?? 'Không có ghi chú.'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button className="action-quick-btn outline" onClick={onBack}>← Quay lại danh sách</button>
      </div>
    </div>
  );
};