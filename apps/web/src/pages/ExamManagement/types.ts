export type ExamStatus = 'draft' | 'published' | 'archived';
export type ExamDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type ScoringMethod = 'equal' | 'weighted';

export interface Subject {
  id: number;
  name: string;
  description?: string;
  topics?: Topic[];
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  description?: string;
}

export interface QuestionOption {
  id: number;
  question_id: number;
  content: string;
  is_correct: boolean;
  sort_order: number;
}

export interface Question {
  id: number;
  subject_id: number;
  topic_id?: number;
  content: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: 'single_choice' | 'multiple_choice';
  status: 'draft' | 'published' | 'hidden';
  options?: QuestionOption[];
}

export interface ExamQuestionItem {
  id?: number;
  exam_id?: number;
  question_id: number;
  points: number;
  sort_order: number;
  question?: Question;
}

export interface ExamRevision {
  id: number;
  exam_id: number;
  changed_by: number;
  change_note?: string;
  created_at: string;
  changed_by_user?: {
    id: number;
    full_name: string;
    role?: string;
  };
}

export interface Exam {
  id: number;
  title: string;
  code?: string;
  subject_id: number;
  topic_id?: number;
  difficulty: ExamDifficulty;
  duration_minutes: number;
  total_questions: number;
  scoring_method: ScoringMethod;
  pass_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_result_type?: 'immediately' | 'after_closed' | 'no';
  status: ExamStatus;
  is_auto_generated: boolean;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
  subject?: Subject;
  topic?: Topic;
  creator?: {
    id: number;
    full_name: string;
    role?: string;
  };
  revisions_count?: number;
  attempts_count?: number;
  exam_questions?: ExamQuestionItem[];
}

export interface ExamStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface ExamFilter {
  search: string;
  subject_id: string;
  status: string;
  difficulty: string;
}

export interface AutoGenerateParams {
  subject_id: number;
  total_questions: number;
  easy_percent: number;
  medium_percent: number;
  hard_percent: number;
  exclude_recent_exams: boolean;
}

export interface AutoGeneratePreview {
  summary: {
    target_easy: number;
    actual_easy: number;
    target_medium: number;
    actual_medium: number;
    target_hard: number;
    actual_hard: number;
    total_requested: number;
    total_picked: number;
    is_criteria_met: boolean;
  };
  questions: Question[];
}
