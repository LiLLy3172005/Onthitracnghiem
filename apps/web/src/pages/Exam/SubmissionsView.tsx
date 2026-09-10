import React from "react";
import type { ExamSet } from "../../data/examMockData";
import { useExamData } from "../../context/ExamDataContext";

const IconArrowLeft = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const STATUS_LABEL: Record<string, string> = {
  in_progress: "Đang làm",
  submitted: "Đã nộp - có kết quả",
};

const SubmissionsView: React.FC<{ examSet: ExamSet; onBack: () => void }> = ({ examSet, onBack }) => {
  const { getAttemptsForExam } = useExamData();
  const attempts = getAttemptsForExam(examSet.id);

  return (
    <>
      <button className="back-link" onClick={onBack}>
        <IconArrowLeft />
        Tất cả bộ đề
      </button>

      <header className="exam-header">
        <div>
          <p className="exam-eyebrow">{examSet.subject} · Bài đã nộp</p>
          <h1>{examSet.title}</h1>
          <p className="exam-subtitle">{attempts.length} lượt làm bài</p>
        </div>
      </header>

      {attempts.length === 0 ? (
        <div className="set-empty">
          <p>Chưa có học viên nào làm bộ đề này.</p>
        </div>
      ) : (
        <div className="table-card-wrapper">
          <table className="landing-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Trạng thái</th>
                <th>Điểm</th>
                <th>Bắt đầu</th>
                <th>Nộp lúc</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.learnerName}</strong></td>
                  <td>
                    <span className={`status-pill ${a.status === "submitted" ? "done" : "pending"}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                  </td>
                  <td>{a.scoreOn10 != null ? `${a.scoreOn10}/10` : "—"}</td>
                  <td>{a.startedAt}</td>
                  <td>{a.submittedAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default SubmissionsView;
