import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExamData } from "../../context/ExamDataContext";
import "./TakeExam.css";

const DIFFICULTY_LABEL: Record<string, string> = {
  de: "Dễ",
  trungbinh: "Trung bình",
  kho: "Khó",
};

type Phase = "intro" | "doing" | "result";

export const TakeExam: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const {
    examSets,
    questions,
    findInProgressAttempt,
    startAttempt,
    saveAttemptAnswers,
    submitAttempt,
  } = useExamData();

  const examSet = examSets.find((s) => s.id === setId);
  const examQuestions = useMemo(
    () => questions.filter((q) => q.examId === setId && q.status === "active"),
    [questions, setId]
  );

  const [learnerName, setLearnerName] = useState("Học viên");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ correctCount: number; total: number; scoreOn10: number } | null>(null);

  const existingAttempt = setId ? findInProgressAttempt(setId, learnerName) : undefined;

  useEffect(() => {
    if (phase !== "doing" || !examSet) return;
    if (secondsLeft === null) {
      setSecondsLeft(examSet.duration * 60);
      return;
    }
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  if (!examSet) {
    return (
      <div className="take-exam-empty">
        <p>Không tìm thấy bộ đề này.</p>
        <button className="btn btn--primary" onClick={() => navigate("/exams")}>
          Quay lại
        </button>
      </div>
    );
  }

  const total = examQuestions.length;

  const beginOrResume = () => {
    const attempt = startAttempt(examSet.id, learnerName);
    setAttemptId(attempt.id);
    setAnswers(attempt.answers);
    // tìm câu đầu tiên chưa trả lời để vào tiếp cho tiện
    const firstUnanswered = examQuestions.findIndex((q) => !attempt.answers[q.id]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setPhase("doing");
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (attemptId) saveAttemptAnswers(attemptId, next);
  };

  const handleExit = () => {
    // đáp án đã được lưu liên tục qua saveAttemptAnswers rồi, chỉ cần điều hướng ra
    navigate("/exams");
  };

  const handleSubmit = () => {
    const graded = examQuestions.map((q) => {
      const chosenId = answers[q.id];
      const correctOption = q.options.find((o) => o.correct);
      return chosenId != null && chosenId === correctOption?.id;
    });
    const correctCount = graded.filter(Boolean).length;
    const scoreOn10 = total > 0 ? Math.round((correctCount / total) * 10 * 10) / 10 : 0;
    const result = { correctCount, total, scoreOn10 };
    setLastResult(result);
    if (attemptId) submitAttempt(attemptId, result);
    setPhase("result");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  /* --------------------------- Màn hình giới thiệu -------------------------- */
  if (phase === "intro") {
    return (
      <div className="take-exam-page">
        <div className="take-exam-intro">
          <p className="take-exam-eyebrow">{examSet.subject}</p>
          <h1>{examSet.title}</h1>

          <label className="take-exam-name-field">
            <span>Tên của bạn</span>
            <input
              type="text"
              value={learnerName}
              onChange={(e) => setLearnerName(e.target.value || "Học viên")}
              placeholder="Nhập tên để hệ thống ghi nhận kết quả"
            />
          </label>

          <ul className="take-exam-info-list">
            <li>Số câu hỏi: <strong>{total}</strong></li>
            <li>Thời gian làm bài: <strong>{examSet.duration} phút</strong></li>
          </ul>

          {existingAttempt && (
            <p className="take-exam-resume-note">
              Bạn đang có 1 bài làm dở ({Object.keys(existingAttempt.answers).length}/{total} câu đã trả lời).
            </p>
          )}

          {total === 0 ? (
            <p className="take-exam-warning">Bộ đề này chưa có câu hỏi nào đang hoạt động.</p>
          ) : (
            <button className="btn btn--primary" onClick={beginOrResume}>
              {existingAttempt ? "Tiếp tục làm bài" : "Bắt đầu làm bài"}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------ Màn hình kết quả --------------------------- */
  if (phase === "result" && lastResult) {
    const gradedResults = examQuestions.map((q) => {
      const chosenId = answers[q.id];
      const correctOption = q.options.find((o) => o.correct);
      const isCorrect = chosenId != null && chosenId === correctOption?.id;
      return { question: q, chosenId, isCorrect };
    });

    return (
      <div className="take-exam-page">
        <div className="take-exam-result">
          <p className="take-exam-eyebrow">{examSet.title} · {learnerName}</p>
          <h1 className="result-score">{lastResult.scoreOn10}/10</h1>
          <p className="result-sub">
            Đúng {lastResult.correctCount}/{lastResult.total} câu (
            {Math.round((lastResult.correctCount / lastResult.total) * 100)}%)
          </p>

          <div className="result-list">
            {gradedResults.map((r, i) => (
              <div key={r.question.id} className={`result-item ${r.isCorrect ? "result-item--correct" : "result-item--wrong"}`}>
                <div className="result-item__head">
                  <span>Câu {i + 1}</span>
                  <span className={`chip chip--${r.question.difficulty}`}>
                    {DIFFICULTY_LABEL[r.question.difficulty]}
                  </span>
                </div>
                <p className="result-item__content">{r.question.content}</p>
                <div className="result-item__options">
                  {r.question.options.map((o) => {
                    const isChosen = r.chosenId === o.id;
                    const isCorrectOpt = o.correct;
                    return (
                      <div
                        key={o.id}
                        className={[
                          "result-option",
                          isCorrectOpt ? "result-option--correct" : "",
                          isChosen && !isCorrectOpt ? "result-option--chosen-wrong" : "",
                        ].join(" ")}
                      >
                        <span>{o.id.toUpperCase()}.</span> {o.text}
                        {isChosen && <em> (bạn chọn)</em>}
                      </div>
                    );
                  })}
                </div>
                {r.question.explanation && (
                  <p className="result-item__explain">Giải thích: {r.question.explanation}</p>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="btn btn--ghost" onClick={() => navigate("/exams")}>
              Về danh sách bộ đề
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------- Màn hình làm bài -------------------------- */
  const q = examQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="take-exam-page">
      <div className="take-exam-doing">
        <header className="take-exam-topbar">
          <button className="take-exam-exit" onClick={handleExit}>← Thoát</button>
          <span>{examSet.title}</span>
          {secondsLeft !== null && <span className="take-exam-timer">{formatTime(secondsLeft)}</span>}
        </header>

        <div className="take-exam-progress">
          Câu {currentIndex + 1}/{total} · Đã trả lời {answeredCount}/{total}
        </div>

        <div className="take-exam-question-card">
          <p className="take-exam-question-content">{q.content}</p>
          <div className="take-exam-options">
            {q.options.map((o) => (
              <button
                key={o.id}
                className={`take-exam-option ${answers[q.id] === o.id ? "take-exam-option--selected" : ""}`}
                onClick={() => selectAnswer(q.id, o.id)}
              >
                <span className="take-exam-option__letter">{o.id.toUpperCase()}</span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="take-exam-nav">
          <button
            className="btn btn--ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            Câu trước
          </button>

          <div className="take-exam-dots">
            {examQuestions.map((qq, i) => (
              <button
                key={qq.id}
                className={[
                  "take-exam-dot",
                  i === currentIndex ? "take-exam-dot--active" : "",
                  answers[qq.id] ? "take-exam-dot--done" : "",
                ].join(" ")}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < total - 1 ? (
            <button className="btn btn--primary" onClick={() => setCurrentIndex((i) => i + 1)}>
              Câu tiếp
            </button>
          ) : (
            <button className="btn btn--primary" onClick={handleSubmit}>
              Nộp bài
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
