import React, { useState } from 'react';
import type { Exam } from '../types';

interface StatusModalProps {
  exam: Exam;
  onConfirm: (status: 'draft' | 'published' | 'archived', note?: string) => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: 'draft' | 'published' | 'archived'; label: string; desc: string; icon: string }[] = [
  {
    value: 'draft',
    label: 'Bản nháp',
    desc: 'Đề thi ẩn, chỉ người tạo xem được. Có thể chỉnh sửa tự do.',
    icon: '📝',
  },
  {
    value: 'published',
    label: 'Đã xuất bản',
    desc: 'Đề thi công khai, học viên có thể truy cập và làm bài.',
    icon: '🟢',
  },
  {
    value: 'archived',
    label: 'Lưu trữ / Ẩn',
    desc: 'Đề thi bị ẩn, không ai làm mới. Dữ liệu lịch sử được giữ nguyên.',
    icon: '📦',
  },
];

export const StatusModal: React.FC<StatusModalProps> = ({ exam, onConfirm, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'published' | 'archived'>(exam.status);
  const [note, setNote] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Cập nhật Trạng thái Đề thi</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8f5ee', borderRadius: 12, fontSize: 13 }}>
          <strong>{exam.title}</strong>
          {exam.code && (
            <span style={{ marginLeft: 8, fontSize: 10, fontFamily: 'monospace', color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: 4 }}>
              {exam.code}
            </span>
          )}
        </div>

        {/* Status options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                border: `2px solid ${selectedStatus === opt.value ? '#E5A038' : '#eae3d8'}`,
                background: selectedStatus === opt.value ? '#fffbeb' : '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                name="status"
                value={opt.value}
                checked={selectedStatus === opt.value}
                onChange={() => setSelectedStatus(opt.value)}
                style={{ marginTop: 2 }}
                disabled={opt.value === exam.status}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>
                  {opt.icon} {opt.label}
                  {opt.value === exam.status && (
                    <span style={{ fontSize: 10, marginLeft: 6, color: '#9ca3af' }}>(hiện tại)</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Note */}
        <div className="form-group">
          <label className="form-label">Ghi chú thay đổi (tùy chọn)</label>
          <textarea
            className="form-control"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Lý do thay đổi trạng thái..."
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="action-quick-btn gold"
            style={{ flex: 1 }}
            onClick={() => onConfirm(selectedStatus, note || undefined)}
            disabled={selectedStatus === exam.status}
          >
            Xác nhận thay đổi
          </button>
          <button className="action-quick-btn outline" onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};