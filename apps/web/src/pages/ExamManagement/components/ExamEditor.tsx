import React, { useState } from 'react';
import type { Exam, Subject, Question, ExamQuestionItem } from '../types';

interface ExamEditorProps {
  exam: Exam | null;
  subjects: Subject[];
  questions: Question[];
  onSave: (payload: any) => void;
  onCancel: () => void;
}

const DIFF_OPTIONS = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
  { value: 'mixed', label: 'Tổng hợp (Mixed)' },
];

const SCORING_OPTIONS = [
  { value: 'equal', label: 'Điểm bằng nhau (10đ chia đều)' },
  { value: 'weighted', label: 'Trọng số riêng từng câu' },
];

const RESULT_OPTIONS = [
  { value: 'immediately', label: 'Ngay sau nộp bài' },
  { value: 'after_closed', label: 'Sau khi đóng đề' },
  { value: 'no', label: 'Không hiển thị' },
];

export const ExamEditor: React.FC<ExamEditorProps> = ({ exam, subjects, questions, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: exam?.title ?? '',
    subject_id: exam?.subject_id?.toString() ?? '',
    topic_id: exam?.topic_id?.toString() ?? '',
    difficulty: exam?.difficulty ?? 'medium',
    duration_minutes: exam?.duration_minutes ?? 60,
    scoring_method: exam?.scoring_method ?? 'equal',
    pass_score: exam?.pass_score ?? 5,
    max_attempts: exam?.max_attempts ?? 1,
    shuffle_questions: exam?.shuffle_questions ?? true,
    shuffle_options: exam?.shuffle_options ?? true,
    show_result_type: exam?.show_result_type ?? 'immediately',
    status: exam?.status ?? 'draft',
    change_note: '',
  });

  const [examQuestions, setExamQuestions] = useState<ExamQuestionItem[]>(
    exam?.exam_questions ?? []
  );

  const [qSearch, setQSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedSubjectTopics = subjects.find((s) => s.id === Number(form.subject_id))?.topics ?? [];

  const filteredQuestions = questions.filter((q) => {
    if (form.subject_id && q.subject_id !== Number(form.subject_id)) return false;
    if (qSearch && !q.content.toLowerCase().includes(qSearch.toLowerCase())) return false;
    return true;
  });

  const isQuestionAdded = (qId: number) => examQuestions.some((eq) => eq.question_id === qId);

  const addQuestion = (q: Question) => {
    if (isQuestionAdded(q.id)) return;
    const count = examQuestions.length + 1;
    const eq: ExamQuestionItem = {
      question_id: q.id,
      points: form.scoring_method === 'equal' ? parseFloat((10 / count).toFixed(4)) : 1,
      sort_order: count,
      question: q,
    };
    setExamQuestions((prev) => [...prev, eq]);
  };

  const removeQuestion = (qId: number) => {
    setExamQuestions((prev) => prev.filter((eq) => eq.question_id !== qId));
  };

  const updatePoints = (qId: number, pts: number) => {
    setExamQuestions((prev) =>
      prev.map((eq) => eq.question_id === qId ? { ...eq, points: pts } : eq)
    );
  };

  const moveQuestion = (idx: number, dir: 'up' | 'down') => {
    const arr = [...examQuestions];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    setExamQuestions(arr.map((eq, i) => ({ ...eq, sort_order: i + 1 })));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Tên đề thi là bắt buộc';
    if (!form.subject_id) errs.subject_id = 'Vui lòng chọn môn học';
    if (form.duration_minutes < 1) errs.duration_minutes = 'Thời gian phải >= 1 phút';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      ...form,
      subject_id: Number(form.subject_id),
      topic_id: form.topic_id ? Number(form.topic_id) : null,
      questions: examQuestions.map((eq, i) => ({
        question_id: eq.question_id,
        points: eq.points,
        sort_order: i + 1,
      })),
    });
  };

  const difficultyColor: Record<string, string> = {
    easy: '#16a34a', medium: '#d97706', hard: '#dc2626', mixed: '#2563eb',
  };

  return (
    <div className="editor-layout">
      {/* LEFT — Config Panel */}
      <div>
        <div className="editor-card" style={{ marginBottom: 20 }}>
          <div className="editor-card-header">⚙️ Thông tin đề thi</div>

          {/* Tiêu đề */}
          <div className="form-group">
            <label className="form-label">Tên đề thi <span className="req">*</span></label>
            <input
              className="form-control"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ví dụ: Kiểm tra giữa kỳ Lập trình Web"
            />
            {errors.title && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 4 }}>{errors.title}</div>}
          </div>

          {/* Môn học */}
          <div className="form-group">
            <label className="form-label">Môn học <span className="req">*</span></label>
            <select
              className="form-control"
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value, topic_id: '' })}
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subject_id && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 4 }}>{errors.subject_id}</div>}
          </div>

          {/* Chủ đề */}
          {selectedSubjectTopics.length > 0 && (
            <div className="form-group">
              <label className="form-label">Chủ đề / Chương</label>
              <select
                className="form-control"
                value={form.topic_id}
                onChange={(e) => setForm({ ...form, topic_id: e.target.value })}
              >
                <option value="">-- Tất cả chủ đề --</option>
                {selectedSubjectTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Độ khó + Thời gian */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Độ khó</label>
              <select
                className="form-control"
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
              >
                {DIFF_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thời gian (phút)</label>
              <input
                type="number"
                className="form-control"
                min={1}
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              />
              {errors.duration_minutes && <div style={{ color: '#dc2626', fontSize: 11, marginTop: 4 }}>{errors.duration_minutes}</div>}
            </div>
          </div>

          {/* Cách tính điểm + Điểm qua */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Cách tính điểm</label>
              <select
                className="form-control"
                value={form.scoring_method}
                onChange={(e) => setForm({ ...form, scoring_method: e.target.value as any })}
              >
                {SCORING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Điểm đạt (/ 10)</label>
              <input
                type="number"
                className="form-control"
                min={0} max={10} step={0.5}
                value={form.pass_score}
                onChange={(e) => setForm({ ...form, pass_score: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Max attempts + Hiển thị kết quả */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Số lượt làm (0 = ∞)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={form.max_attempts}
                onChange={(e) => setForm({ ...form, max_attempts: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Hiển thị kết quả</label>
              <select
                className="form-control"
                value={form.show_result_type}
                onChange={(e) => setForm({ ...form, show_result_type: e.target.value as any })}
              >
                {RESULT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Shuffle options */}
          <div style={{ marginBottom: 16 }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.shuffle_questions}
                onChange={(e) => setForm({ ...form, shuffle_questions: e.target.checked })}
              />
              Đảo thứ tự câu hỏi khi làm bài
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.shuffle_options}
                onChange={(e) => setForm({ ...form, shuffle_options: e.target.checked })}
              />
              Đảo đáp án trong mỗi câu
            </label>
          </div>

          {/* Trạng thái */}
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-control"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="draft">📝 Bản nháp</option>
              <option value="published">🟢 Xuất bản ngay</option>
              <option value="archived">📦 Lưu trữ</option>
            </select>
          </div>

          {/* Ghi chú thay đổi */}
          <div className="form-group">
            <label className="form-label">Ghi chú thay đổi</label>
            <textarea
              className="form-control"
              rows={2}
              value={form.change_note}
              onChange={(e) => setForm({ ...form, change_note: e.target.value })}
              placeholder="Mô tả ngắn gọn nội dung thay đổi (tùy chọn)"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="action-quick-btn gold" style={{ flex: 1 }} onClick={handleSubmit}>
            💾 {exam ? 'Lưu thay đổi' : 'Tạo đề thi'}
          </button>
          <button className="action-quick-btn outline" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </div>

      {/* RIGHT — Question Panel */}
      <div>
        {/* Questions in exam */}
        <div className="editor-card" style={{ marginBottom: 20 }}>
          <div className="editor-card-header">
            <span>📋 Danh sách câu hỏi ({examQuestions.length})</span>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
              Tổng điểm: {examQuestions.reduce((s, eq) => s + eq.points, 0).toFixed(2)}đ
            </span>
          </div>

          {examQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
              Chưa có câu hỏi. Chọn câu hỏi từ ngân hàng bên dưới ↓
            </div>
          ) : (
            examQuestions.map((eq, idx) => {
              const q = eq.question;
              const diff = q?.difficulty ?? 'medium';
              return (
                <div key={eq.question_id} className="editor-q-item">
                  <div className="q-index-badge">{idx + 1}</div>
                  <div className="q-body">
                    <div className="q-body-text">
                      {q?.content
                        ? q.content.length > 120
                          ? q.content.substring(0, 120) + '…'
                          : q.content
                        : `Câu hỏi #${eq.question_id}`}
                    </div>
                    <div className="q-meta-tags">
                      <span style={{ color: difficultyColor[diff] }}>
                        ● {diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'TB' : 'Khó'}
                      </span>
                      <span>#{eq.question_id}</span>
                      {q?.question_type === 'multiple_choice' && <span style={{ color: '#7c3aed' }}>Chọn nhiều</span>}
                    </div>
                  </div>
                  <div className="q-points-box">
                    {form.scoring_method === 'weighted' ? (
                      <input
                        type="number"
                        className="q-points-input"
                        min={0} step={0.5}
                        value={eq.points}
                        onChange={(e) => updatePoints(eq.question_id, Number(e.target.value))}
                      />
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{eq.points.toFixed(2)}đ</span>
                    )}
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
                      <button
                        className="icon-btn"
                        title="Di chuyển lên"
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0}
                      >↑</button>
                      <button
                        className="icon-btn"
                        title="Di chuyển xuống"
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === examQuestions.length - 1}
                      >↓</button>
                      <button
                        className="icon-btn danger"
                        title="Xóa khỏi đề"
                        onClick={() => removeQuestion(eq.question_id)}
                      >✕</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Question bank picker */}
        <div className="editor-card">
          <div className="editor-card-header">🏦 Ngân hàng câu hỏi</div>

          <div style={{ marginBottom: 12 }}>
            <input
              className="form-control"
              placeholder="Tìm câu hỏi..."
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
            />
          </div>

          <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
                {form.subject_id ? 'Không có câu hỏi nào phù hợp.' : 'Chọn môn học để xem câu hỏi.'}
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const added = isQuestionAdded(q.id);
                return (
                  <div
                    key={q.id}
                    className="add-q-dashed-banner"
                    style={added ? { opacity: 0.5, background: '#f9fafb' } : {}}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#161618', lineHeight: 1.4 }}>
                        {q.content.length > 100 ? q.content.substring(0, 100) + '…' : q.content}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                        <span style={{ color: difficultyColor[q.difficulty] }}>
                          ● {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'TB' : 'Khó'}
                        </span>
                        {' · '}#{q.id}
                      </div>
                    </div>
                    <button
                      className={`action-quick-btn ${added ? 'outline' : 'gold'}`}
                      style={{ fontSize: 11, padding: '5px 12px' }}
                      onClick={() => added ? removeQuestion(q.id) : addQuestion(q)}
                    >
                      {added ? '✓ Đã thêm' : '+ Thêm'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};