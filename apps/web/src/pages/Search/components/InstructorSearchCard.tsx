import React from 'react';
import { resolveFileUrl } from '@onthitracnghiem/shared';

export interface InstructorSearchItem {
  id: number;
  user_id: number;
  full_name: string;
  avatar_url?: string;
  specialization: string;
  bio?: string;
  verified_at?: string;
  subjects: string[];
  exams_count: number;
  questions_count: number;
  rating: number;
}

interface InstructorSearchCardProps {
  instructor: InstructorSearchItem;
  onFilterExamsByInstructor?: (userId: number) => void;
}

export const InstructorSearchCard: React.FC<InstructorSearchCardProps> = ({
  instructor,
  onFilterExamsByInstructor,
}) => {
  return (
    <div className="m7-instructor-card">
      <div className="m7-ins-header">
        <div className="m7-ins-avatar-wrap">
          {instructor.avatar_url ? (
            <img src={resolveFileUrl(instructor.avatar_url)} alt={instructor.full_name} className="m7-ins-avatar" />
          ) : (
            <div className="m7-ins-avatar-fallback">
              {instructor.full_name?.charAt(0) || 'G'}
            </div>
          )}
          <span className="m7-verified-badge" title="Giảng viên đã được Ban Quản Trị xác minh">
            ✓
          </span>
        </div>

        <div className="m7-ins-title-wrap">
          <div className="m7-ins-name-row">
            <h3 className="m7-ins-name">{instructor.full_name}</h3>
            <div className="m7-rating-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{instructor.rating?.toFixed(1) || '5.0'}</span>
            </div>
          </div>
          <p className="m7-ins-spec">{instructor.specialization}</p>
        </div>
      </div>

      {instructor.bio && (
        <p className="m7-ins-bio">{instructor.bio}</p>
      )}

      <div className="m7-ins-subjects">
        {instructor.subjects?.map((subName) => (
          <span key={subName} className="m7-ins-sub-chip">
            {subName}
          </span>
        ))}
      </div>

      <div className="m7-ins-footer">
        <div className="m7-ins-stats">
          <div className="m7-stat-pill">
            <strong>{instructor.exams_count}</strong> đề thi đã phát hành
          </div>
        </div>

        <button
          className="m7-btn-view-exams"
          onClick={() => onFilterExamsByInstructor && onFilterExamsByInstructor(instructor.user_id)}
        >
          <span>Xem các đề thi</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InstructorSearchCard;
