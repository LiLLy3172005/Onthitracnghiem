import React from 'react';
import type { Exam } from '../types';

interface DeleteModalProps {
  exam: Exam;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ exam, onConfirm, onClose }) => {
  const hasAttempts = (exam.attempts_count ?? 0) > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{hasAttempts ? '⚠️ Đóng / Lưu trữ Đề thi' : '🗑️ Xóa Đề thi'}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Exam info */}
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{exam.title}</div>
          {exam.code && (
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#dc2626' }}>{exam.code}</span>
          )}
        </div>

        {hasAttempts ? (
          <div>
            <div style={{
              padding: '12px 14px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 16,
            }}>
              <strong>⚠️ Đề thi đã có {exam.attempts_count} lượt làm bài.</strong>
              <p style={{ marginTop: 8, color: '#4b5563', lineHeight: 1.5 }}>
                Để bảo vệ kết quả học viên, hệ thống sẽ thực hiện <strong>Soft delete</strong>:
                chuyển đề sang trạng thái <strong>Lưu trữ / Ẩn</strong> và ẩn khỏi danh sách,
                nhưng toàn bộ dữ liệu lịch sử làm bài vẫn được lưu trữ an toàn.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              padding: '12px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 16,
            }}>
              <strong>🗑️ Xóa vĩnh viễn đề thi này?</strong>
              <p style={{ marginTop: 8, color: '#4b5563', lineHeight: 1.5 }}>
                Đề thi chưa có lượt làm bài nào. Thao tác này sẽ <strong>xóa hoàn toàn</strong>{' '}
                đề thi và toàn bộ câu hỏi bên trong. <strong>Không thể hoàn tác.</strong>
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="action-quick-btn"
            style={{
              flex: 1,
              background: hasAttempts ? '#d97706' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '9px 16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={onConfirm}
          >
            {hasAttempts ? '📦 Lưu trữ & Ẩn đề thi' : '🗑️ Xóa vĩnh viễn'}
          </button>
          <button className="action-quick-btn outline" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};