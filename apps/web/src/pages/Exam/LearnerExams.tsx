import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useExamData } from "../../context/ExamDataContext";
import "./Exam.css"; // dùng lại class .set-grid, .set-card... đã có

const IconClock = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
  </svg>
);
const IconLayers = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);

export const LearnerExams: React.FC = () => {
  const navigate = useNavigate();
  const { examSets, questions } = useExamData();

  const publishedSets = examSets.filter((s) => s.status === "published");
  const questionCount = (setId: string) =>
    questions.filter((q) => q.examId === setId && q.status === "active").length;

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="exam-page">
        <header className="exam-header">
          <div>
            <p className="exam-eyebrow">Luyện đề</p>
            <h1>Danh sách bộ đề</h1>
            <p className="exam-subtitle">{publishedSets.length} bộ đề đang mở</p>
          </div>
        </header>

        {publishedSets.length > 0 ? (
          <ul className="set-grid">
            {publishedSets.map((s) => (
              <li key={s.id} className="set-card">
                <button className="set-card__main" onClick={() => navigate(`/take-exam/${s.id}`)}>
                  <div className="set-card__top">
                    <span className="set-card__subject">{s.subject}</span>
                  </div>
                  <h2 className="set-card__title">{s.title}</h2>
                  <div className="set-card__meta">
                    <span><IconLayers /> {questionCount(s.id)} câu hỏi</span>
                    <span><IconClock /> {s.duration} phút</span>
                  </div>
                </button>
                <div className="set-card__actions">
                  <button className="btn btn--primary" onClick={() => navigate(`/take-exam/${s.id}`)}>
                    Làm bài
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="set-empty">
            <IconLayers />
            <p>Hiện chưa có bộ đề nào được mở cho học viên.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearnerExams;
