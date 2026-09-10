import React, { createContext, useContext, useState } from "react";

import type { ExamQuestion, ExamSet, ExamAttempt } from "../data/examMockData";
import { initialQuestions, initialExamSets } from "../data/examMockData";

interface ExamDataContextValue {
  examSets: ExamSet[];
  questions: ExamQuestion[];
  attempts: ExamAttempt[];
  saveQuestion: (q: ExamQuestion) => void;
  deleteQuestion: (id: string) => void;
  toggleQuestionStatus: (id: string) => void;
  saveSet: (s: ExamSet) => void;
  deleteSet: (id: string) => void;
  duplicateSet: (s: ExamSet) => void;
  // --- attempts (lượt làm bài) ---
  findInProgressAttempt: (examId: string, learnerName: string) => ExamAttempt | undefined;
  startAttempt: (examId: string, learnerName: string) => ExamAttempt;
  saveAttemptAnswers: (attemptId: string, answers: Record<string, string>) => void;
  submitAttempt: (
    attemptId: string,
    result: { correctCount: number; total: number; scoreOn10: number }
  ) => void;
  getAttemptsForExam: (examId: string) => ExamAttempt[];
}

const ExamDataContext = createContext<ExamDataContextValue | null>(null);

export const ExamDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [examSets, setExamSets] = useState<ExamSet[]>(initialExamSets);
  const [questions, setQuestions] = useState<ExamQuestion[]>(initialQuestions);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  const saveQuestion = (q: ExamQuestion) => {
    setQuestions((prev) => {
      const exists = prev.some((p) => p.id === q.id);
      return exists ? prev.map((p) => (p.id === q.id ? q : p)) : [q, ...prev];
    });
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const toggleQuestionStatus = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: q.status === "active" ? "hidden" : "active" } : q))
    );
  };

  const saveSet = (s: ExamSet) => {
    setExamSets((prev) => {
      const exists = prev.some((p) => p.id === s.id);
      return exists ? prev.map((p) => (p.id === s.id ? s : p)) : [s, ...prev];
    });
  };

  const deleteSet = (id: string) => {
    setExamSets((prev) => prev.filter((s) => s.id !== id));
    setQuestions((prev) => prev.filter((q) => q.examId !== id));
    setAttempts((prev) => prev.filter((a) => a.examId !== id));
  };

  const duplicateSet = (s: ExamSet) => {
    const newId = `e${Date.now()}`;
    setExamSets((prev) => [
      { ...s, id: newId, title: `${s.title} (bản sao)`, status: "draft", updatedAt: "Vừa xong" },
      ...prev,
    ]);
    setQuestions((prev) => [
      ...prev
        .filter((q) => q.examId === s.id)
        .map((q) => ({ ...q, id: `q${Date.now()}${Math.random().toString(16).slice(2)}`, examId: newId })),
      ...prev,
    ]);
  };

  // --- attempts ---

  const findInProgressAttempt = (examId: string, learnerName: string) =>
    attempts.find((a) => a.examId === examId && a.learnerName === learnerName && a.status === "in_progress");

  const startAttempt = (examId: string, learnerName: string): ExamAttempt => {
    const existing = findInProgressAttempt(examId, learnerName);
    if (existing) return existing;

    const newAttempt: ExamAttempt = {
      id: `at${Date.now()}`,
      examId,
      learnerName,
      answers: {},
      status: "in_progress",
      startedAt: "Vừa xong",
    };
    setAttempts((prev) => [newAttempt, ...prev]);
    return newAttempt;
  };

  const saveAttemptAnswers = (attemptId: string, answers: Record<string, string>) => {
    setAttempts((prev) => prev.map((a) => (a.id === attemptId ? { ...a, answers } : a)));
  };

  const submitAttempt: ExamDataContextValue["submitAttempt"] = (attemptId, result) => {
    setAttempts((prev) =>
      prev.map((a) =>
        a.id === attemptId
          ? {
              ...a,
              status: "submitted",
              submittedAt: "Vừa xong",
              correctCount: result.correctCount,
              total: result.total,
              scoreOn10: result.scoreOn10,
            }
          : a
      )
    );
  };

  const getAttemptsForExam = (examId: string) => attempts.filter((a) => a.examId === examId);

  return (
    <ExamDataContext.Provider
      value={{
        examSets,
        questions,
        attempts,
        saveQuestion,
        deleteQuestion,
        toggleQuestionStatus,
        saveSet,
        deleteSet,
        duplicateSet,
        findInProgressAttempt,
        startAttempt,
        saveAttemptAnswers,
        submitAttempt,
        getAttemptsForExam,
      }}
    >
      {children}
    </ExamDataContext.Provider>
  );
};

export function useExamData() {
  const ctx = useContext(ExamDataContext);
  if (!ctx) throw new Error("useExamData phải được dùng bên trong <ExamDataProvider>");
  return ctx;
}
