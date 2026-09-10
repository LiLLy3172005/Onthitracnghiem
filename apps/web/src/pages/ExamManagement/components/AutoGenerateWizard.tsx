import React, { useState } from 'react';
import type { Subject, AutoGeneratePreview, AutoGenerateParams } from '../types';

interface AutoGenerateWizardProps {
  subjects: Subject[];
  preview: AutoGeneratePreview | null;
  onPreview: (params: AutoGenerateParams) => Promise<AutoGeneratePreview | null>;
  onConfirm: (payload: any) => void;
  onCancel: () => void;
}

export const AutoGenerateWizard: React.FC<AutoGenerateWizardProps> = ({
  subjects,
  preview,
  onPreview,
  onConfirm,
  onCancel,
}) => {
  const [params, setParams] = useState<AutoGenerateParams>({
    subject_id: 0,
    total_questions: 30,
    easy_percent: 30,
    medium_percent: 40,
    hard_percent: 30,
    exclude_recent_exams: false,
  });

  const [examTitle, setExamTitle] = useState('');
  const [examStatus, setExamStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tổng % phải bằng 100
  const totalPercent = params.easy_percent + params.medium_percent + params.hard_percent;
  const isPercentValid = totalPercent === 100;

  const handleAutoAdjustHard = () => {
    const remain = 100 - params.easy_percent - params.medium_percent;
    setParams({ ...params, hard_percent: Math.max(0, remain) });
  };

  const handlePreview = async () => {
    if (!params.subject_id) { setError('Vui lòng chọn môn học'); return; }
    if (!isPercentValid) { setError(`Tổng tỉ lệ phải bằng 100% (hiện tại: ${totalPercent}%)`); return; }
    setError('');
    setLoading(true);
    await onPreview(params);
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!examTitle.trim()) { setError('Vui lòng nhập tên đề thi'); return; }
    if (!preview) { setError('Vui lòng sinh đề trước'); return; }

    onConfirm({
      title: examTitle,
      subject_id: params.subject_id,
      difficulty: 'mixed',
      duration_minutes: 60,
      scoring_method: 'equal',
      pass_score: 5,
      status: examStatus,
      is_auto_generated: true,
      change_note: `Sinh tự động từ ngân hàng câu hỏi: ${params.easy_percent}% Dễ - ${params.medium_percent}% TB - ${params.hard_percent}% Khó.`,
      questions: preview.questions.map((q, i) => ({
        question_id: q.id,
        points: parseFloat((10 / preview.questions.length).toFixed(4)),
        sort_order: i + 1,
      })),
    });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="editor-card" style={{ marginBottom: 20 }}>
        <div className="editor-card-header">⚡ Bộ tham số sinh đề</div>

        {/* Môn học */}
        <div className="form-group">
          <label className="form-label">Môn học <span className="req">*</span></label>
          <select
            className="form-control"
            value={params.subject_id || ''}
            onChange={(e) => setParams({ ...params, subject_id: Number(e.target.value) })}
          >
            <option value="">-- Chọn môn học --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Tổng số câu */}
        <div className="form-group">
          <label className="form-label">Tổng số câu hỏi</label>
          <input
            type="number"
            className="form-control"
            min={5} max={200}
            value={params.total_questions}
            onChange={(e) => setParams({ ...params, total_questions: Number(e.target.value) })}
          />
        </div>

        {/* Tỉ lệ theo độ khó */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Tỉ lệ độ khó</span>
            <span style={{ fontSize: 12, color: isPercentValid ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
              {totalPercent}% / 100%
            </span>
          </div>

          {/* Easy */}
          <div className="slider-group">
            <div className="slider-header">
              <span style={{ color: '#16a34a' }}>🟢 Dễ</span>
              <span>{params.easy_percent}%</span>
            </div>
            <input
              type="range" min={0} max={100} className="range-slider easy"
              value={params.easy_percent}
              onChange={(e) => setParams({ ...params, easy_percent: Number(e.target.value) })}
            />
          </div>

          {/* Medium */}
          <div className="slider-group">
            <div className="slider-header">
              <span style={{ color: '#d97706' }}>🟡 Trung bình</span>
              <span>{params.medium_percent}%</span>
            </div>
            <input
              type="range" min={0} max={100} className="range-slider medium"
              value={params.medium_percent}
              onChange={(e) => setParams({ ...params, medium_percent: Number(e.target.value) })}
            />
          </div>

          {/* Hard */}
          <div className="slider-group">
            <div className="slider-header">
              <span style={{ color: '#dc2626' }}>🔴 Khó</span>
              <span>{params.hard_percent}%</span>
            </div>
            <input
              type="range" min={0} max={100} className="range-slider hard"
              value={params.hard_percent}
              onChange={(e) => setParams({ ...params, hard_percent: Number(e.target.value) })}
            />
          </div>

          <button
            style={{ fontSize: 11, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={handleAutoAdjustHard}
          >
            ↺ Tự động điều chỉnh % Khó cho đủ 100%
          </button>
        </div>

        {/* Loại trừ đề gần đây */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={params.exclude_recent_exams}
            onChange={(e) => setParams({ ...params, exclude_recent_exams: e.target.checked })}
          />
          Loại trừ câu hỏi đã dùng trong 3 đề gần nhất
        </label>

        {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 8 }}>{error}</div>}

        <div style={{ marginTop: 16 }}>
          <button
            className="action-quick-btn gold"
            style={{ width: '100%' }}
            onClick={handlePreview}
            disabled={loading}
          >
            {loading ? '⏳ Đang tìm câu hỏi...' : '🎲 Sinh đề ngẫu nhiên & Xem trước'}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      {preview && (
        <div className="editor-card">
          <div className="editor-card-header">
            <span>📊 Kết quả sinh đề</span>
            <span style={{
              fontSize: 12,
              color: preview.summary.is_criteria_met ? '#16a34a' : '#dc2626',
              fontWeight: 700
            }}>
              {preview.summary.is_criteria_met ? '✅ Đủ câu hỏi' : '⚠️ Thiếu câu hỏi'}
            </span>
          </div>

          {/* Summary chips */}
          <div className="preview-summary-grid" style={{ marginBottom: 20 }}>
            <div className="preview-chip easy">
              <div className="preview-chip-title">Dễ</div>
              <div className="preview-chip-val" style={{ color: '#16a34a' }}>
                {preview.summary.actual_easy} / {preview.summary.target_easy}
              </div>
            </div>
            <div className="preview-chip medium">
              <div className="preview-chip-title">Trung bình</div>
              <div className="preview-chip-val" style={{ color: '#d97706' }}>
                {preview.summary.actual_medium} / {preview.summary.target_medium}
              </div>
            </div>
            <div className="preview-chip hard">
              <div className="preview-chip-title">Khó</div>
              <div className="preview-chip-val" style={{ color: '#dc2626' }}>
                {preview.summary.actual_hard} / {preview.summary.target_hard}
              </div>
            </div>
          </div>

          {/* Question list preview */}
          <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 20 }}>
            {preview.questions.map((q, i) => (
              <div key={q.id} className="editor-q-item" style={{ marginBottom: 8 }}>
                <div className="q-index-badge">{i + 1}</div>
                <div className="q-body">
                  <div className="q-body-text">
                    {q.content.length > 100 ? q.content.substring(0, 100) + '…' : q.content}
                  </div>
                  <div className="q-meta-tags">
                    <span style={{ color: q.difficulty === 'easy' ? '#16a34a' : q.difficulty === 'medium' ? '#d97706' : '#dc2626' }}>
                      ● {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'TB' : 'Khó'}
                    </span>
                    <span>#{q.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confirm section */}
          <div style={{ borderTop: '1px solid #eae3d8', paddingTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Tên đề thi <span className="req">*</span></label>
              <input
                className="form-control"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Nhập tên cho đề thi được sinh tự động"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-control"
                value={examStatus}
                onChange={(e) => setExamStatus(e.target.value as any)}
              >
                <option value="draft">📝 Lưu nháp</option>
                <option value="published">🟢 Xuất bản ngay</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="action-quick-btn gold" style={{ flex: 1 }} onClick={handleConfirm}>
                ✅ Lưu đề thi ({preview.summary.total_picked} câu)
              </button>
              <button className="action-quick-btn outline" onClick={onCancel}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {!preview && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="action-quick-btn outline" onClick={onCancel}>← Quay lại</button>
        </div>
      )}
    </div>
  );
};