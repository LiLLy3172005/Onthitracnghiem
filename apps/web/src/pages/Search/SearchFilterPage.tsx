import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, resolveFileUrl } from '@onthitracnghiem/shared';
import './SearchFilter.css';
import ExamCard from './components/ExamCard';
import type { ExamItem } from './components/ExamCard';
import QuestionCard from './components/QuestionCard';
import type { QuestionItem } from './components/QuestionCard';
import InstructorSearchCard from './components/InstructorSearchCard';
import type { InstructorSearchItem } from './components/InstructorSearchCard';

interface SubjectMeta {
  id: number;
  name: string;
  exam_count: number;
  topics: { id: number; name: string }[];
}

interface InstructorMeta {
  id: number;
  full_name: string;
}

interface FilterMeta {
  subjects: SubjectMeta[];
  instructors: InstructorMeta[];
  difficulty_levels: { value: string; label: string }[];
  questions_ranges: { value: string; label: string }[];
  duration_ranges: { value: string; label: string }[];
  sort_options: { value: string; label: string }[];
}

interface OmniResults {
  exams: any[];
  questions: any[];
  instructors: any[];
}

interface SearchFilterPageProps {
  initialTab?: 'exams' | 'questions' | 'instructors';
}

export const SearchFilterPage: React.FC<SearchFilterPageProps> = ({ initialTab = 'exams' }) => {
  const [searchParams] = useSearchParams();

  // Active tab: exams / questions / instructors
  const [activeTab, setActiveTab] = useState<'exams' | 'questions' | 'instructors'>(
    (searchParams.get('tab') as any) || initialTab
  );

  // Search input state
  const [keyword, setKeyword] = useState<string>(searchParams.get('q') || '');
  const [meta, setMeta] = useState<FilterMeta | null>(null);

  // Filter criteria for Exams
  const [subjectId, setSubjectId] = useState<string>(searchParams.get('subject_id') || 'all');
  const [topicId, setTopicId] = useState<string>(searchParams.get('topic_id') || 'all');
  const [difficulty, setDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [questionsRange, setQuestionsRange] = useState<string>(searchParams.get('questions_range') || 'all');
  const [durationRange, setDurationRange] = useState<string>(searchParams.get('duration_range') || 'all');
  const [instructorId, setInstructorId] = useState<string>(searchParams.get('instructor_id') || 'all');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort_by') || 'latest');

  // Results state
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [instructors, setInstructors] = useState<InstructorSearchItem[]>([]);

  // Performance metrics
  const [totalCount, setTotalCount] = useState<number>(0);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // OmniSearch Dropdown
  const [omniQuery, setOmniQuery] = useState<string>('');
  const [omniResults, setOmniResults] = useState<OmniResults | null>(null);
  const [showOmniDropdown, setShowOmniDropdown] = useState<boolean>(false);
  const omniRef = useRef<HTMLDivElement>(null);

  // User auth state
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = () => {
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          setCurrentUser(JSON.parse(raw));
        } catch {
          setCurrentUser(null);
        }
      }
    };
    loadUser();

    const handleUserUpdate = (e: any) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        loadUser();
      }
    };

    window.addEventListener('user_updated', handleUserUpdate);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('user_updated', handleUserUpdate);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await api.get('/search/meta');
        if (res.data.status === 'success') {
          setMeta(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching search metadata', err);
      }
    };
    fetchMeta();
  }, []);

  // Click outside to close Omni dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (omniRef.current && !omniRef.current.contains(event.target as Node)) {
        setShowOmniDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live OmniSearch debounce
  useEffect(() => {
    if (!omniQuery.trim()) {
      setOmniResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/search/omni', { params: { q: omniQuery.trim() } });
        if (res.data.status === 'success') {
          setOmniResults(res.data.data);
          setShowOmniDropdown(true);
        }
      } catch {
        // silent
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [omniQuery]);

  // Main search/filter execution
  useEffect(() => {
    fetchResults();
  }, [activeTab, keyword, subjectId, topicId, difficulty, questionsRange, durationRange, instructorId, sortBy]);

  // Reset topic when subject changes
  useEffect(() => {
    setTopicId('all');
  }, [subjectId]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'exams') {
        const res = await api.get('/search/exams', {
          params: {
            q: keyword,
            subject_id: subjectId,
            topic_id: topicId,
            difficulty,
            questions_range: questionsRange,
            duration_range: durationRange,
            instructor_id: instructorId,
            sort_by: sortBy,
          },
        });
        if (res.data.status === 'success') {
          setExams(res.data.data.items || []);
          setTotalCount(res.data.data.total || 0);
          setExecutionTimeMs(res.data.execution_time_ms || 0);
        }
      } else if (activeTab === 'questions') {
        const res = await api.get('/search/questions', {
          params: {
            q: keyword,
            subject_id: subjectId,
            topic_id: topicId,
            difficulty,
            sort_by: sortBy,
          },
        });
        if (res.data.status === 'success') {
          setQuestions(res.data.data.items || []);
          setTotalCount(res.data.data.total || 0);
          setExecutionTimeMs(res.data.execution_time_ms || 0);
        }
      } else if (activeTab === 'instructors') {
        const res = await api.get('/search/instructors', {
          params: {
            q: keyword,
            subject_id: subjectId,
            sort_by: sortBy,
          },
        });
        if (res.data.status === 'success') {
          setInstructors(res.data.data || []);
          setTotalCount(res.data.total || 0);
          setExecutionTimeMs(res.data.execution_time_ms || 0);
        }
      }
    } catch (err) {
      console.error('Error searching', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(omniQuery);
    setShowOmniDropdown(false);
  };

  const handleQuickTagClick = (tag: string) => {
    setKeyword(tag);
    setOmniQuery(tag);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setOmniQuery('');
    setSubjectId('all');
    setTopicId('all');
    setDifficulty('all');
    setQuestionsRange('all');
    setDurationRange('all');
    setInstructorId('all');
    setSortBy('latest');
  };

  // Selected subject's available topics
  const currentSubjectMeta = meta?.subjects.find((s) => s.id.toString() === subjectId);
  const availableTopics = currentSubjectMeta?.topics || [];

  // Active filters list for chips bar
  const activeFilters = [];
  if (keyword.trim()) activeFilters.push({ key: 'q', label: `Từ khóa: "${keyword}"`, onRemove: () => { setKeyword(''); setOmniQuery(''); } });
  if (subjectId !== 'all') {
    const sName = meta?.subjects.find((s) => s.id.toString() === subjectId)?.name || 'Môn';
    activeFilters.push({ key: 'subject', label: `Môn: ${sName}`, onRemove: () => setSubjectId('all') });
  }
  if (topicId !== 'all') {
    const tName = availableTopics.find((t) => t.id.toString() === topicId)?.name || 'Chủ đề';
    activeFilters.push({ key: 'topic', label: `Chủ đề: ${tName}`, onRemove: () => setTopicId('all') });
  }
  if (difficulty !== 'all') {
    const dLabel = meta?.difficulty_levels.find((d) => d.value === difficulty)?.label || difficulty;
    activeFilters.push({ key: 'diff', label: dLabel, onRemove: () => setDifficulty('all') });
  }
  if (questionsRange !== 'all') {
    const qLabel = meta?.questions_ranges.find((q) => q.value === questionsRange)?.label || questionsRange;
    activeFilters.push({ key: 'qr', label: qLabel, onRemove: () => setQuestionsRange('all') });
  }
  if (durationRange !== 'all') {
    const dLabel = meta?.duration_ranges.find((d) => d.value === durationRange)?.label || durationRange;
    activeFilters.push({ key: 'dur', label: dLabel, onRemove: () => setDurationRange('all') });
  }
  if (instructorId !== 'all') {
    const insName = meta?.instructors.find((i) => i.id.toString() === instructorId)?.full_name || 'Giảng viên';
    activeFilters.push({ key: 'ins', label: `GV: ${insName}`, onRemove: () => setInstructorId('all') });
  }

  return (
    <div className="m7-container">
      {/* Top Header Navbar */}
      <header className="m2-header">
        <div className="m2-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/home" className="m2-logo-group">
              <div className="m2-logo-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div className="m2-logo-text">
                Brain <span>Blitz</span>
              </div>
            </Link>

            <Link to="/home" className="m2-back-home-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Trang chủ</span>
            </Link>
          </div>

          <nav className="m2-role-picker">
            <button
              className={`m2-role-btn ${activeTab === 'exams' ? 'active' : ''}`}
              onClick={() => setActiveTab('exams')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>Kho Đề Thi</span>
            </button>
            <button
              className={`m2-role-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Ngân Hàng Câu Hỏi</span>
            </button>
            <button
              className={`m2-role-btn ${activeTab === 'instructors' ? 'active' : ''}`}
              onClick={() => setActiveTab('instructors')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>Đội Ngũ Giảng Viên</span>
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#1e1e24' }}>
                  {currentUser.avatar_url ? (
                    <img src={resolveFileUrl(currentUser.avatar_url)} alt={currentUser.full_name} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1e3a8a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                      {currentUser.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{currentUser.full_name}</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="m2-btn m2-btn-secondary m2-btn-sm">Đăng nhập</Link>
                <Link to="/register" className="m2-btn m2-btn-primary m2-btn-sm">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with OmniSearch */}
      <section className="m7-hero-section">
        <div className="m7-hero-inner">
          <div className="m7-hero-badge">
            <span>✦</span> Hệ Thống Tìm Kiếm & Lọc Đa Tiêu Chí Chuẩn Hóa
          </div>
          <h1 className="m7-hero-title">
            Tìm kiếm đề thi & <span>ngân hàng câu hỏi</span> chuẩn quốc gia
          </h1>
          <p className="m7-hero-subtitle">
            Khám phá kho đề thi trắc nghiệm chuẩn hóa, lọc nhanh theo môn học, độ khó, số lượng câu hỏi và tác giả uy tín với phản hồi tức thì.
          </p>

          {/* Search Bar with Omni Dropdown */}
          <div className="m7-search-bar-wrap" ref={omniRef}>
            <form onSubmit={handleSearchSubmit} className="m7-search-input-box">
              <svg className="m7-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="m7-search-input"
                placeholder="Tìm theo tên đề, chuyên đề, câu hỏi, hoặc giảng viên..."
                value={omniQuery}
                onChange={(e) => {
                  setOmniQuery(e.target.value);
                  setShowOmniDropdown(true);
                }}
                onFocus={() => {
                  if (omniResults) setShowOmniDropdown(true);
                }}
              />
              {omniQuery && (
                <button
                  type="button"
                  className="m7-clear-btn"
                  onClick={() => {
                    setOmniQuery('');
                    setKeyword('');
                    setShowOmniDropdown(false);
                  }}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
              <button type="submit" className="m7-search-submit-btn">
                <span>Tìm kiếm</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </form>

            {/* OmniSearch Suggestions Dropdown */}
            {showOmniDropdown && omniResults && (
              <div className="m7-omni-dropdown">
                {omniResults.exams?.length > 0 && (
                  <div className="m7-omni-group">
                    <div className="m7-omni-header">
                      <span>📑 Đề thi phù hợp</span>
                    </div>
                    {omniResults.exams.map((ex: any) => (
                      <div
                        key={ex.id}
                        className="m7-omni-item"
                        onClick={() => {
                          setKeyword(ex.title);
                          setActiveTab('exams');
                          setShowOmniDropdown(false);
                        }}
                      >
                        <span className="m7-omni-title">{ex.title}</span>
                        <span className="m7-omni-meta">{ex.subject?.name} • {ex.duration_minutes}p</span>
                      </div>
                    ))}
                  </div>
                )}

                {omniResults.questions?.length > 0 && (
                  <div className="m7-omni-group">
                    <div className="m7-omni-header">
                      <span>❓ Câu hỏi trắc nghiệm</span>
                    </div>
                    {omniResults.questions.map((q: any) => (
                      <div
                        key={q.id}
                        className="m7-omni-item"
                        onClick={() => {
                          setKeyword(q.content.substring(0, 30));
                          setActiveTab('questions');
                          setShowOmniDropdown(false);
                        }}
                      >
                        <span className="m7-omni-title" style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.content}
                        </span>
                        <span className="m7-omni-meta">{q.subject?.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {omniResults.instructors?.length > 0 && (
                  <div className="m7-omni-group">
                    <div className="m7-omni-header">
                      <span>👨‍🏫 Giảng viên uy tín</span>
                    </div>
                    {omniResults.instructors.map((ins: any) => (
                      <div
                        key={ins.id}
                        className="m7-omni-item"
                        onClick={() => {
                          setKeyword(ins.full_name);
                          setActiveTab('instructors');
                          setShowOmniDropdown(false);
                        }}
                      >
                        <span className="m7-omni-title">{ins.full_name}</span>
                        <span className="m7-omni-meta">{ins.specialization}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick suggested chips */}
            <div className="m7-quick-tags">
              <span className="m7-tag-label">Gợi ý tìm nhanh:</span>
              <span className="m7-tag-pill" onClick={() => handleQuickTagClick('Toán THPTQG')}>Toán THPTQG 2026</span>
              <span className="m7-tag-pill" onClick={() => handleQuickTagClick('Ngữ pháp 12 thì')}>12 Thì Tiếng Anh</span>
              <span className="m7-tag-pill" onClick={() => handleQuickTagClick('Dao động cơ')}>Dao động cơ học</span>
              <span className="m7-tag-pill" onClick={() => handleQuickTagClick('Đánh giá năng lực')}>Đề ĐGNL ĐHQG</span>
              <span className="m7-tag-pill" onClick={() => handleQuickTagClick('Nguyễn Văn An')}>ThS. Nguyễn Văn An</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <main className="m7-main-wrap">
        {/* Navigation Tabs Bar */}
        <div className="m7-tab-nav">
          <button
            className={`m7-tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            <span>📑 Đề thi</span>
            <span className="m7-tab-badge">{activeTab === 'exams' ? totalCount : '13+'}</span>
          </button>
          <button
            className={`m7-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <span>❓ Ngân hàng câu hỏi</span>
            <span className="m7-tab-badge">{activeTab === 'questions' ? totalCount : '18+'}</span>
          </button>
          <button
            className={`m7-tab-btn ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructors')}
          >
            <span>👨‍🏫 Nguồn đề & Giảng viên</span>
            <span className="m7-tab-badge">{activeTab === 'instructors' ? totalCount : '5+'}</span>
          </button>
        </div>

        <div className="m7-body-grid">
          {/* Left Filter Sidebar */}
          <aside className="m7-filter-sidebar">
            <div className="m7-sidebar-header">
              <span className="m7-sidebar-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Bộ lọc đa tiêu chí
              </span>
              {activeFilters.length > 0 && (
                <button className="m7-btn-reset-filters" onClick={handleResetFilters}>
                  Đặt lại
                </button>
              )}
            </div>

            {/* Môn học */}
            <div className="m7-filter-group">
              <div className="m7-filter-label">
                <span>Môn học</span>
                {subjectId !== 'all' && (
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer' }} onClick={() => setSubjectId('all')}>
                    Tất cả
                  </span>
                )}
              </div>
              <div className="m7-pill-options">
                <div
                  className={`m7-pill-radio ${subjectId === 'all' ? 'active' : ''}`}
                  onClick={() => setSubjectId('all')}
                >
                  <span>Tất cả môn học</span>
                </div>
                {meta?.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className={`m7-pill-radio ${subjectId === sub.id.toString() ? 'active' : ''}`}
                    onClick={() => setSubjectId(sub.id.toString())}
                  >
                    <span>{sub.name}</span>
                    <span className="m7-count-tag">{sub.exam_count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chủ đề (chỉ hiện khi đã chọn 1 môn học có chủ đề) */}
            {availableTopics.length > 0 && (
              <div className="m7-filter-group">
                <div className="m7-filter-label">Chuyên đề chi tiết</div>
                <select
                  className="m7-filter-select"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                >
                  <option value="all">Tất cả chuyên đề ({availableTopics.length})</option>
                  {availableTopics.map((t) => (
                    <option key={t.id} value={t.id.toString()}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Độ khó */}
            <div className="m7-filter-group">
              <div className="m7-filter-label">Mức độ khó</div>
              <select
                className="m7-filter-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                {meta?.difficulty_levels.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Số lượng câu hỏi (chỉ cho tab exams) */}
            {activeTab === 'exams' && (
              <div className="m7-filter-group">
                <div className="m7-filter-label">Số lượng câu hỏi</div>
                <select
                  className="m7-filter-select"
                  value={questionsRange}
                  onChange={(e) => setQuestionsRange(e.target.value)}
                >
                  {meta?.questions_ranges.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Thời gian làm bài (chỉ cho tab exams) */}
            {activeTab === 'exams' && (
              <div className="m7-filter-group">
                <div className="m7-filter-label">Thời lượng làm bài</div>
                <select
                  className="m7-filter-select"
                  value={durationRange}
                  onChange={(e) => setDurationRange(e.target.value)}
                >
                  {meta?.duration_ranges.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Giảng viên biên soạn (chỉ cho tab exams) */}
            {activeTab === 'exams' && (
              <div className="m7-filter-group">
                <div className="m7-filter-label">Giảng viên biên soạn</div>
                <select
                  className="m7-filter-select"
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                >
                  <option value="all">Tất cả giảng viên</option>
                  {meta?.instructors.map((ins) => (
                    <option key={ins.id} value={ins.id.toString()}>{ins.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </aside>

          {/* Right Content Area */}
          <section className="m7-content-col">
            {/* Top Action Bar: Stats & Sort */}
            <div className="m7-top-action-bar">
              <div className="m7-result-stats">
                <span className="m7-found-text">
                  Tìm thấy {totalCount} {activeTab === 'exams' ? 'đề thi' : activeTab === 'questions' ? 'câu hỏi' : 'giảng viên'}
                </span>
                <span className="m7-time-badge" title="Thời gian xử lý API trên máy chủ">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{executionTimeMs}ms (Đạt chuẩn &lt; 2s)</span>
                </span>
              </div>

              <div className="m7-sort-wrap">
                <span className="m7-sort-label">Sắp xếp:</span>
                <select
                  className="m7-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {meta?.sort_options.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Chips */}
            {activeFilters.length > 0 && (
              <div className="m7-active-chips-bar">
                <span className="m7-chips-label">Đang lọc theo:</span>
                {activeFilters.map((f) => (
                  <span key={f.key} className="m7-filter-chip">
                    {f.label}
                    <button className="m7-chip-remove" onClick={f.onRemove} title="Bỏ lọc">
                      ✕
                    </button>
                  </span>
                ))}
                <button
                  className="m7-btn-reset-filters"
                  style={{ marginLeft: '4px' }}
                  onClick={handleResetFilters}
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="m7-loading-state">
                <div className="m7-spinner" />
                <span>Đang truy vấn dữ liệu...</span>
              </div>
            ) : (
              <>
                {/* 1. Tab ĐỀ THI */}
                {activeTab === 'exams' && (
                  exams.length > 0 ? (
                    <div className="m7-exams-grid">
                      {exams.map((exam) => (
                        <ExamCard
                          key={exam.id}
                          exam={exam}
                          onSelectSubject={(sId) => setSubjectId(sId.toString())}
                          onSelectInstructor={(insId) => setInstructorId(insId.toString())}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="m7-empty-state">
                      <div className="m7-empty-icon">🔍</div>
                      <div className="m7-empty-title">Không tìm thấy đề thi phù hợp</div>
                      <p className="m7-empty-desc">
                        Không có đề thi nào thỏa mãn tất cả {activeFilters.length} tiêu chí lọc của bạn. Hãy thử nới lỏng bộ lọc hoặc xóa từ khóa.
                      </p>
                      <button className="m7-empty-btn" onClick={handleResetFilters}>
                        Đặt lại toàn bộ bộ lọc
                      </button>
                    </div>
                  )
                )}

                {/* 2. Tab CÂU HỎI */}
                {activeTab === 'questions' && (
                  questions.length > 0 ? (
                    <div className="m7-questions-list">
                      {questions.map((q, idx) => (
                        <QuestionCard key={q.id} question={q} index={idx + 1} />
                      ))}
                    </div>
                  ) : (
                    <div className="m7-empty-state">
                      <div className="m7-empty-icon">❓</div>
                      <div className="m7-empty-title">Không có câu hỏi phù hợp</div>
                      <p className="m7-empty-desc">
                        Thử tìm kiếm với từ khóa khác hoặc chuyển môn học.
                      </p>
                      <button className="m7-empty-btn" onClick={handleResetFilters}>
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  )
                )}

                {/* 3. Tab GIẢNG VIÊN */}
                {activeTab === 'instructors' && (
                  instructors.length > 0 ? (
                    <div className="m7-instructors-grid">
                      {instructors.map((ins) => (
                        <InstructorSearchCard
                          key={ins.id}
                          instructor={ins}
                          onFilterExamsByInstructor={(insUserId) => {
                            setInstructorId(insUserId.toString());
                            setActiveTab('exams');
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="m7-empty-state">
                      <div className="m7-empty-icon">👨‍🏫</div>
                      <div className="m7-empty-title">Không tìm thấy giảng viên</div>
                      <p className="m7-empty-desc">
                        Thử tìm theo tên khác hoặc chuyển môn học.
                      </p>
                      <button className="m7-empty-btn" onClick={handleResetFilters}>
                        Đặt lại bộ lọc
                      </button>
                    </div>
                  )
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default SearchFilterPage;
