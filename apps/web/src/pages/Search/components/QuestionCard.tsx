import React, { useState } from 'react';

export interface QuestionOptionItem {
  id: number;
  question_id: number;
  content: string;
  is_correct: boolean;
  sort_order: number;
}

export interface QuestionItem {
  id: number;
  content: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: string;
  status: string;
  subject?: { id: number; name: string };
  topic?: { id: number; name: string };
  creator?: { id: number; full_name: string };
  options?: QuestionOptionItem[];
}

interface QuestionCardProps {
  question: QuestionItem;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { label: 'Dễ', class: 'm7-diff-easy' };
      case 'medium':
        return { label: 'Trung bình', class: 'm7-diff-medium' };
      case 'hard':
        return { label: 'Khó', class: 'm7-diff-hard' };
      default:
        return { label: diff, class: 'm7-diff-mixed' };
    }
  };

  const diffInfo = getDifficultyBadge(question.difficulty);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="m7-question-card">
      <div className="m7-card-top">
        <div className="m7-badge-group">
          <span className="m7-q-index">Câu {index}</span>
          {question.subject && (
            <span className="m7-subject-badge">{question.subject.name}</span>
          )}
          {question.topic && (
            <span className="m7-topic-badge">{question.topic.name}</span>
          )}
          <span className={`m7-diff-badge ${diffInfo.class}`}>
            <span className="m7-dot" /> {diffInfo.label}
          </span>
        </div>

        {question.creator && (
          <span className="m7-q-author">Tạo bởi: {question.creator.full_name}</span>
        )}
      </div>

      <div className="m7-q-content">
        {question.content}
      </div>

      {question.options && question.options.length > 0 && (
        <div className="m7-options-list">
          {question.options.map((opt, idx) => {
            const letter = optionLetters[idx] || (idx + 1).toString();
            const isChosen = selectedOption === opt.id;
            let optClass = 'm7-option-item';

            if (showExplanation) {
              if (opt.is_correct) {
                optClass += ' m7-option-correct';
              } else if (isChosen && !opt.is_correct) {
                optClass += ' m7-option-wrong';
              }
            } else if (isChosen) {
              optClass += ' m7-option-selected';
            }

            return (
              <div
                key={opt.id}
                className={optClass}
                onClick={() => setSelectedOption(opt.id)}
              >
                <span className="m7-option-letter">{letter}</span>
                <span className="m7-option-text">{opt.content}</span>
                {showExplanation && opt.is_correct && (
                  <span className="m7-check-correct" title="Đáp án chính xác">✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="m7-q-actions">
        <button
          className="m7-btn-explanation"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{showExplanation ? 'Ẩn lời giải chi tiết' : 'Xem đáp án & Lời giải'}</span>
        </button>
      </div>

      {showExplanation && (
        <div className="m7-explanation-box">
          <div className="m7-explanation-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <strong>Giải thích chi tiết & Phương pháp giải:</strong>
          </div>
          <p className="m7-explanation-body">
            {question.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
