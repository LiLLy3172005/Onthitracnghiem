import React from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveFileUrl } from '@onthitracnghiem/shared';

export interface ExamItem {
  id: number;
  title: string;
  description?: string;
  subject_id: number;
  topic_id?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  duration_minutes: number;
  total_questions: number;
  pass_score?: number;
  status: string;
  rating: number;
  views_count: number;
  attempts_count?: number;
  subject?: { id: number; name: string };
  topic?: { id: number; name: string };
  creator?: { id: number; full_name: string; avatar_url?: string };
  created_at?: string;
}

interface ExamCardProps {
  exam: ExamItem;
  onSelectSubject?: (subjectId: number) => void;
  onSelectInstructor?: (instructorId: number) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onSelectSubject, onSelectInstructor }) => {
  const navigate = useNavigate();

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return { label: 'Dễ', class: 'm7-diff-easy' };
      case 'medium':
        return { label: 'Trung bình', class: 'm7-diff-medium' };
      case 'hard':
        return { label: 'Khó (9+)', class: 'm7-diff-hard' };
      case 'mixed':
      default:
        return { label: 'Tổng hợp', class: 'm7-diff-mixed' };
    }
  };

  const diffInfo = getDifficultyBadge(exam.difficulty);

  const handleStartExam = () => {
    // Navigate to exam taker or login
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(`/exams/${exam.id}`);
    }
  };

  return (
    <div className="m7-exam-card">
      <div className="m7-card-top">
        <div className="m7-badge-group">
          {exam.subject && (
            <span
              className="m7-subject-badge"
              onClick={() => onSelectSubject && onSelectSubject(exam.subject_id)}
              title="Lọc theo môn này"
            >
              {exam.subject.name}
            </span>
          )}
          <span className={`m7-diff-badge ${diffInfo.class}`}>
            <span className="m7-dot" /> {diffInfo.label}
          </span>
        </div>

        <div className="m7-rating-pill" title={`Đánh giá: ${exam.rating}/5.0`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{exam.rating?.toFixed(1) || '5.0'}</span>
        </div>
      </div>

      <h3 className="m7-exam-title" onClick={handleStartExam} title={exam.title}>
        {exam.title}
      </h3>

      {exam.description && (
        <p className="m7-exam-desc">{exam.description}</p>
      )}

      {exam.topic && (
        <div className="m7-topic-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span>Chủ đề: {exam.topic.name}</span>
        </div>
      )}

      <div className="m7-exam-meta-grid">
        <div className="m7-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{exam.duration_minutes} phút</span>
        </div>
        <div className="m7-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>{exam.total_questions} câu hỏi</span>
        </div>
        <div className="m7-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{exam.attempts_count || 0} lượt thi</span>
        </div>
      </div>

      <div className="m7-card-footer">
        <div
          className="m7-author-info"
          onClick={() => exam.creator && onSelectInstructor && onSelectInstructor(exam.creator.id)}
          title="Xem thêm đề thi của giảng viên này"
        >
          {exam.creator?.avatar_url ? (
            <img src={resolveFileUrl(exam.creator.avatar_url)} alt={exam.creator.full_name} className="m7-author-avatar" />
          ) : (
            <div className="m7-author-avatar-fallback">
              {exam.creator?.full_name?.charAt(0) || 'G'}
            </div>
          )}
          <span className="m7-author-name">{exam.creator?.full_name || 'Giảng viên Brain Blitz'}</span>
        </div>

        <button className="m7-btn-start" onClick={handleStartExam}>
          Làm bài ngay
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ExamCard;
