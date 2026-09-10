import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import "./Exam.css";
import SubmissionsView from "./SubmissionsView";
import type {
  Difficulty,
  MediaType,
  AnswerOption,
  ExamQuestion,
  ExamSet,
} from "../../data/examMockData";
import {
  DIFFICULTY_LABEL,
  SET_STATUS_LABEL,
  MEDIA_LABEL,
  SUBJECTS,
  DIFFICULTIES,
} from "../../data/examMockData";
import { useExamData } from "../../context/ExamDataContext";

/* --------------------------------- Icons ---------------------------------- */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconPlus = () => (
  <svg {...iconProps}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const IconUpload = () => (
  <svg {...iconProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
);
const IconSearch = () => (
  <svg {...iconProps}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
const IconEdit = () => (
  <svg {...iconProps}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
);
const IconTrash = () => (
  <svg {...iconProps}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
);
const IconImage = () => (
  <svg {...iconProps}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
);
const IconAudio = () => (
  <svg {...iconProps}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
);
const IconFormula = () => (
  <svg {...iconProps}><path d="M4 7V5a1 1 0 0 1 1-1h1" /><path d="M4 17v2a1 1 0 0 0 1 1h1" /><path d="M20 7V5a1 1 0 0 0-1-1h-1" /><path d="M20 17v2a1 1 0 0 1-1 1h-1" /><line x1="9" y1="12" x2="15" y2="12" /></svg>
);
const IconX = () => (
  <svg {...iconProps}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const IconChevron = () => (
  <svg {...iconProps} width={16} height={16}><polyline points="6 9 12 15 18 9" /></svg>
);
const IconEyeOff = () => (
  <svg {...iconProps}><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.7 18.7 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
const IconEye = () => (
  <svg {...iconProps}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const IconCheck = () => (
  <svg {...iconProps}><polyline points="20 6 9 17 4 12" /></svg>
);
const IconArrowLeft = () => (
  <svg {...iconProps}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const IconClock = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>
);
const IconLayers = () => (
  <svg {...iconProps}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
);
const IconCopy = () => (
  <svg {...iconProps}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);

const MediaIcon: React.FC<{ type: MediaType }> = ({ type }) => {
  if (type === "image") return <IconImage />;
  if (type === "audio") return <IconAudio />;
  return <IconFormula />;
};

/* --------------------------------- Panel ----------------------------------- */

interface QuestionFormProps {
  initial: ExamQuestion | null;
  examId: string;
  onCancel: () => void;
  onSave: (q: ExamQuestion) => void;
}

const emptyOptions = (): AnswerOption[] => [
  { id: "a", text: "", correct: true },
  { id: "b", text: "", correct: false },
  { id: "c", text: "", correct: false },
  { id: "d", text: "", correct: false },
];

const QuestionForm: React.FC<QuestionFormProps> = ({ initial, examId, onCancel, onSave }) => {
  const [content, setContent] = useState(initial?.content ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? SUBJECTS[1]);
  const [chapter, setChapter] = useState(initial?.chapter ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "de");
  const [options, setOptions] = useState<AnswerOption[]>(initial?.options ?? emptyOptions());
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [mediaName, setMediaName] = useState<string>(initial?.media ? MEDIA_LABEL[initial.media] : "");

  const setCorrect = (id: string) => {
    setOptions((prev) => prev.map((o) => ({ ...o, correct: o.id === id })));
  };

  const updateOptionText = (id: string, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initial?.id ?? `q${Date.now()}`,
      examId,
      content,
      subject,
      chapter,
      difficulty,
      options,
      explanation,
      media: initial?.media,
      status: initial?.status ?? "active",
      updatedAt: "Vừa xong",
    });
  };

  return (
    <div className="panel-overlay" onClick={onCancel}>
      <form
        className="panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{initial ? "Sửa câu hỏi" : "Thêm câu hỏi"}</p>
            <h2>{initial ? "Cập nhật nội dung" : "Câu hỏi mới"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Đóng">
            <IconX />
          </button>
        </div>

        <div className="panel-body">
          <label className="field">
            <span>Nội dung câu hỏi</span>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi…"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Môn học</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.filter((s) => s !== "Tất cả").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Chương / Bài</span>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="VD: Đạo hàm"
              />
            </label>
          </div>

          <label className="field">
            <span>Độ khó</span>
            <div className="difficulty-picker">
              {(["de", "trungbinh", "kho"] as Difficulty[]).map((d) => (
                <button
                  type="button"
                  key={d}
                  className={`chip chip--${d} ${difficulty === d ? "chip--active" : ""}`}
                  onClick={() => setDifficulty(d)}
                >
                  {DIFFICULTY_LABEL[d]}
                </button>
              ))}
            </div>
          </label>

          <div className="field">
            <span>Đáp án — chọn nút tròn để đánh dấu đáp án đúng</span>
            <div className="options-editor">
              {options.map((o) => (
                <div className="option-row" key={o.id}>
                  <button
                    type="button"
                    className={`option-radio ${o.correct ? "option-radio--correct" : ""}`}
                    onClick={() => setCorrect(o.id)}
                    aria-label={`Đáp án đúng ${o.id}`}
                  >
                    {o.correct && <IconCheck />}
                  </button>
                  <input
                    type="text"
                    value={o.text}
                    onChange={(e) => updateOptionText(o.id, e.target.value)}
                    placeholder={`Đáp án ${o.id.toUpperCase()}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Giải thích</span>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích vì sao đáp án đúng…"
            />
          </label>

          <label className="field">
            <span>Media đính kèm</span>
            <div className="media-upload">
              <IconImage />
              <span>{mediaName || "Kéo thả hoặc chọn hình ảnh, công thức, âm thanh"}</span>
              <input
                type="file"
                onChange={(e) => setMediaName(e.target.files?.[0]?.name ?? "")}
              />
            </div>
          </label>
        </div>

        <div className="panel-footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="btn btn--primary">
            {initial ? "Lưu thay đổi" : "Thêm câu hỏi"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ------------------------------ Import modal ------------------------------- */

const ImportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [fileName, setFileName] = useState("");

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">Nhập hàng loạt</p>
            <h2>Tải lên câu hỏi</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
            <IconX />
          </button>
        </div>
        <div className="panel-body">
          <p className="import-desc">
            Hỗ trợ file Word (.docx), Excel (.xlsx) hoặc CSV. Mỗi dòng/đoạn tương ứng với một câu hỏi
            theo định dạng chuẩn của hệ thống.
          </p>
          <label className="dropzone">
            <IconUpload />
            <span>{fileName || "Chọn file hoặc kéo thả vào đây"}</span>
            <input
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.csv"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
          </label>
        </div>
        <div className="panel-footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn btn--primary" disabled={!fileName} onClick={onClose}>
            Bắt đầu nhập
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- Detail ---------------------------------- */

const DetailPanel: React.FC<{ question: ExamQuestion; onClose: () => void }> = ({ question, onClose }) => (
  <div className="panel-overlay" onClick={onClose}>
    <div className="panel panel--detail" onClick={(e) => e.stopPropagation()}>
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">{question.subject} · {question.chapter}</p>
          <h2>Chi tiết câu hỏi</h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">
          <IconX />
        </button>
      </div>
      <div className="panel-body">
        <p className="detail-content">{question.content}</p>
        <ul className="detail-options">
          {question.options.map((o) => (
            <li key={o.id} className={o.correct ? "detail-options__item--correct" : ""}>
              <span className="detail-options__letter">{o.id.toUpperCase()}</span>
              <span>{o.text}</span>
              {o.correct && <IconCheck />}
            </li>
          ))}
        </ul>
        <div className="detail-block">
          <h4>Giải thích</h4>
          <p>{question.explanation || "Chưa có giải thích."}</p>
        </div>
        <div className="detail-block">
          <h4>Lịch sử chỉnh sửa</h4>
          <p className="detail-history">Cập nhật lần cuối: {question.updatedAt}</p>
        </div>
      </div>
    </div>
  </div>
);

/* --------------------------- Question bank (per set) -------------------------- */

interface QuestionBankViewProps {
  examSet: ExamSet;
  questions: ExamQuestion[];
  onBack: () => void;
  onSave: (q: ExamQuestion) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  examSet,
  questions,
  onBack,
  onSave,
  onDelete,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | Difficulty>("all");
  const [formTarget, setFormTarget] = useState<ExamQuestion | null | "new">(null);
  const [detailTarget, setDetailTarget] = useState<ExamQuestion | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.content.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [questions, search, difficultyFilter]);

  return (
    <>
      <button className="back-link" onClick={onBack}>
        <IconArrowLeft />
        Tất cả bộ đề
      </button>

      <header className="exam-header">
        <div>
          <p className="exam-eyebrow">{examSet.subject} · {examSet.duration} phút</p>
          <h1>{examSet.title}</h1>
          <p className="exam-subtitle">
            {questions.length} câu hỏi · {questions.filter((q) => q.status === "active").length} đang sử dụng
          </p>
        </div>
        <div className="exam-actions">
          <button className="btn btn--ghost" onClick={() => setImportOpen(true)}>
            <IconUpload />
            Nhập hàng loạt
          </button>
          <button className="btn btn--primary" onClick={() => setFormTarget("new")}>
            <IconPlus />
            Thêm câu hỏi
          </button>
        </div>
      </header>

      <div className="exam-filters">
        <label className="search-field">
          <IconSearch />
          <input
            type="text"
            placeholder="Tìm theo nội dung câu hỏi…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="select-field">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as "all" | Difficulty)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <IconChevron />
        </div>
      </div>

      <ul className="question-list">
        {filtered.map((q) => (
          <li key={q.id} className={`question-row question-row--${q.difficulty} ${q.status === "hidden" ? "question-row--hidden" : ""}`}>
            <button className="question-row__main" onClick={() => setDetailTarget(q)}>
              <div className="question-row__meta">
                <span className={`chip chip--${q.difficulty} chip--static`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
                <span className="question-row__tag question-row__tag--muted">{q.chapter}</span>
                {q.media && (
                  <span className="question-row__media" title={MEDIA_LABEL[q.media]}>
                    <MediaIcon type={q.media} />
                  </span>
                )}
                {q.status === "hidden" && <span className="question-row__hidden-tag">Đã ẩn</span>}
              </div>
              <p className="question-row__content">{q.content}</p>
              <p className="question-row__updated">Cập nhật {q.updatedAt}</p>
            </button>

            <div className="question-row__actions">
              <button className="icon-btn" title="Sửa" onClick={() => setFormTarget(q)}>
                <IconEdit />
              </button>
              <button
                className="icon-btn"
                title={q.status === "active" ? "Ẩn câu hỏi" : "Hiện câu hỏi"}
                onClick={() => onToggleStatus(q.id)}
              >
                <IconEyeOff />
              </button>
              <button className="icon-btn icon-btn--danger" title="Xóa" onClick={() => onDelete(q.id)}>
                <IconTrash />
              </button>
            </div>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="question-empty">
            <p>Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.</p>
          </li>
        )}
      </ul>

      {formTarget !== null && (
        <QuestionForm
          initial={formTarget === "new" ? null : formTarget}
          examId={examSet.id}
          onCancel={() => setFormTarget(null)}
          onSave={(q) => {
            onSave(q);
            setFormTarget(null);
          }}
        />
      )}

      {detailTarget && <DetailPanel question={detailTarget} onClose={() => setDetailTarget(null)} />}

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </>
  );
};

/* ------------------------------- Set create form -------------------------------- */

const SetForm: React.FC<{
  initial: ExamSet | null;
  onCancel: () => void;
  onSave: (s: ExamSet) => void;
}> = ({ initial, onCancel, onSave }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? SUBJECTS[1]);
  const [duration, setDuration] = useState(initial?.duration ?? 45);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initial?.id ?? `e${Date.now()}`,
      title,
      subject,
      duration,
      status: initial?.status ?? "draft",
      updatedAt: "Vừa xong",
    });
  };

  return (
    <div className="panel-overlay" onClick={onCancel}>
      <form className="panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="panel-header">
          <div>
            <p className="panel-eyebrow">{initial ? "Sửa bộ đề" : "Bộ đề mới"}</p>
            <h2>{initial ? "Cập nhật thông tin" : "Tạo bộ đề thi"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onCancel} aria-label="Đóng">
            <IconX />
          </button>
        </div>
        <div className="panel-body">
          <label className="field">
            <span>Tên bộ đề</span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề kiểm tra giữa kỳ"
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Môn học</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.filter((s) => s !== "Tất cả").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Thời gian làm bài (phút)</span>
              <input
                type="number"
                min={5}
                required
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>
          </div>
        </div>
        <div className="panel-footer">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="btn btn--primary">
            {initial ? "Lưu thay đổi" : "Tạo bộ đề"}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ---------------------------------- Page ------------------------------------ */

export const Exam: React.FC = () => {
  const {
    examSets,
    questions,
    saveQuestion,
    deleteQuestion,
    toggleQuestionStatus,
    saveSet,
    deleteSet,
    duplicateSet,
  } = useExamData();

  const navigate = useNavigate();
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [submissionsSetId, setSubmissionsSetId] = useState<string | null>(null);
  const [setFormTarget, setSetFormTarget] = useState<ExamSet | null | "new">(null);

  const activeSet = examSets.find((s) => s.id === activeSetId) ?? null;
  const submissionsSet = examSets.find((s) => s.id === submissionsSetId) ?? null;

  const questionCount = (setId: string) => questions.filter((q) => q.examId === setId).length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="exam-page">
        {submissionsSet ? (
          <SubmissionsView
            examSet={submissionsSet}
            onBack={() => setSubmissionsSetId(null)}
          />
        ) : activeSet ? (
          <QuestionBankView
            examSet={activeSet}
            questions={questions.filter((q) => q.examId === activeSet.id)}
            onBack={() => setActiveSetId(null)}
            onSave={saveQuestion}
            onDelete={deleteQuestion}
            onToggleStatus={toggleQuestionStatus}
          />
        ) : (
          <>
            <header className="exam-header">
              <div>
                <p className="exam-eyebrow">Đề thi của tôi</p>
                <h1>Bộ đề thi</h1>
                <p className="exam-subtitle">{examSets.length} bộ đề</p>
              </div>
              <div className="exam-actions">
                <button className="btn btn--primary" onClick={() => setSetFormTarget("new")}>
                  <IconPlus />
                  Tạo bộ đề
                </button>
              </div>
            </header>

            {examSets.length > 0 ? (
              <ul className="set-grid">
                {examSets.map((s) => (
                  <li key={s.id} className="set-card">
                    <button className="set-card__main" onClick={() => setActiveSetId(s.id)}>
                      <div className="set-card__top">
                        <span className={`set-status set-status--${s.status}`}>{SET_STATUS_LABEL[s.status]}</span>
                        <span className="set-card__subject">{s.subject}</span>
                      </div>
                      <h2 className="set-card__title">{s.title}</h2>
                      <div className="set-card__meta">
                        <span><IconLayers /> {questionCount(s.id)} câu hỏi</span>
                        <span><IconClock /> {s.duration} phút</span>
                      </div>
                      <p className="set-card__updated">Cập nhật {s.updatedAt}</p>
                    </button>
                    <div className="set-card__actions">
                      <button className="icon-btn" title="Làm thử" onClick={() => navigate(`/take-exam/${s.id}`)}>
                        <IconEye />
                      </button>
                      <button className="icon-btn" title="Bài đã nộp" onClick={() => setSubmissionsSetId(s.id)}>
                        <IconLayers />
                      </button>
                      <button className="icon-btn" title="Sửa thông tin" onClick={() => setSetFormTarget(s)}>
                        <IconEdit />
                      </button>
                      <button className="icon-btn" title="Nhân bản" onClick={() => duplicateSet(s)}>
                        <IconCopy />
                      </button>
                      <button className="icon-btn icon-btn--danger" title="Xóa bộ đề" onClick={() => deleteSet(s.id)}>
                        <IconTrash />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="set-empty">
                <IconLayers />
                <p>Chưa có bộ đề nào. Tạo bộ đề đầu tiên để bắt đầu thêm câu hỏi.</p>
              </div>
            )}
          </>
        )}
      </main>

      {setFormTarget !== null && (
        <SetForm
          initial={setFormTarget === "new" ? null : setFormTarget}
          onCancel={() => setSetFormTarget(null)}
          onSave={(s) => {
            saveSet(s);
            setSetFormTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default Exam;
