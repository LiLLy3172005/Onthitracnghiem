import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ExamList } from './components/ExamList';
import { ExamEditor } from './components/ExamEditor';
import { AutoGenerateWizard } from './components/AutoGenerateWizard';
import { RevisionHistory } from './components/RevisionHistory';
import { StatusModal } from './components/StatusModal';
import { DeleteModal } from './components/DeleteModal';
import { examApi } from './examApi';
import type {
  Exam,
  ExamFilter,
  ExamStats,
  Subject,
  Question,
  ExamRevision,
  AutoGeneratePreview,
} from './types';
import './ExamManagement.css';

type ActiveScreen = 'list' | 'editor' | 'auto-generate' | 'history';

export const ExamManagement: React.FC = () => {
  const [screen, setScreen] = useState<ActiveScreen>('list');

  // Data states
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<ExamStats>({ total: 0, published: 0, draft: 0, archived: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<ExamFilter>({ search: '', subject_id: '', status: '', difficulty: '' });

  // Editor states
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Modal states
  const [statusModalExam, setStatusModalExam] = useState<Exam | null>(null);
  const [deleteModalExam, setDeleteModalExam] = useState<Exam | null>(null);
  const [historyExam, setHistoryExam] = useState<Exam | null>(null);
  const [revisions, setRevisions] = useState<ExamRevision[]>([]);
  const [autoPreview, setAutoPreview] = useState<AutoGeneratePreview | null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'danger' | 'info' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Load danh sách đề thi
  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const result = await examApi.getExams(filter);
      setExams(result.exams);
      setStats(result.stats);
    } catch {
      showToast('Không thể tải danh sách đề thi.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  // Load resources (subjects + questions)
  const loadResources = useCallback(async () => {
    try {
      const res = await examApi.getResources();
      setSubjects(res.subjects);
      setQuestions(res.questions);
    } catch {
      // silently use mock data from examApi fallback
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleFilterChange = (partial: Partial<ExamFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  };

  // ---- Handlers ----

  const handleCreateNew = () => {
    setEditingExam(null);
    setScreen('editor');
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setScreen('editor');
  };

  const handleOpenAutoGenerate = () => {
    setAutoPreview(null);
    setScreen('auto-generate');
  };

  const handleViewHistory = async (exam: Exam) => {
    setHistoryExam(exam);
    setScreen('history');
    try {
      const data = await examApi.getRevisions(exam.id);
      setRevisions(data);
    } catch {
      showToast('Không thể tải lịch sử chỉnh sửa.', 'danger');
    }
  };

  const handleOpenStatusModal = (exam: Exam) => {
    setStatusModalExam(exam);
  };

  const handleOpenDeleteModal = (exam: Exam) => {
    setDeleteModalExam(exam);
  };

  const handleSaveExam = async (payload: any) => {
    try {
      if (editingExam) {
        await examApi.updateExam(editingExam.id, payload);
        showToast('Đã cập nhật đề thi thành công!', 'success');
      } else {
        await examApi.createExam(payload);
        showToast('Đã tạo đề thi mới thành công!', 'success');
      }
      setScreen('list');
      loadExams();
    } catch {
      showToast('Lưu thất bại. Vui lòng thử lại.', 'danger');
    }
  };

  const handleStatusChange = async (status: 'draft' | 'published' | 'archived', note?: string) => {
    if (!statusModalExam) return;
    try {
      await examApi.updateStatus(statusModalExam.id, status, note);
      showToast('Đã cập nhật trạng thái thành công!', 'success');
      setStatusModalExam(null);
      loadExams();
    } catch {
      showToast('Cập nhật trạng thái thất bại.', 'danger');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalExam) return;
    try {
      const res = await examApi.deleteExam(deleteModalExam.id);
      showToast(res.message, res.mode === 'deleted' ? 'success' : 'info');
      setDeleteModalExam(null);
      loadExams();
    } catch {
      showToast('Xóa đề thi thất bại.', 'danger');
    }
  };

  const handleAutoGeneratePreview = async (params: any) => {
    try {
      const preview = await examApi.autoGenerate(params);
      setAutoPreview(preview);
      return preview;
    } catch {
      showToast('Sinh đề thất bại.', 'danger');
      return null;
    }
  };

  const handleConfirmAutoGenerate = async (payload: any) => {
    try {
      await examApi.createExam({ ...payload, is_auto_generated: true });
      showToast('Đề thi được sinh tự động và tạo thành công!', 'success');
      setScreen('list');
      loadExams();
    } catch {
      showToast('Tạo đề tự động thất bại.', 'danger');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'editor':
        return (
          <ExamEditor
            exam={editingExam}
            subjects={subjects}
            questions={questions}
            onSave={handleSaveExam}
            onCancel={() => setScreen('list')}
          />
        );
      case 'auto-generate':
        return (
          <AutoGenerateWizard
            subjects={subjects}
            preview={autoPreview}
            onPreview={handleAutoGeneratePreview}
            onConfirm={handleConfirmAutoGenerate}
            onCancel={() => setScreen('list')}
          />
        );
      case 'history':
        return (
          <RevisionHistory
            exam={historyExam}
            revisions={revisions}
            onBack={() => setScreen('list')}
          />
        );
      default:
        return (
          <ExamList
            exams={exams}
            stats={stats}
            filter={filter}
            subjects={subjects}
            loading={loading}
            onFilterChange={handleFilterChange}
            onCreateNew={handleCreateNew}
            onOpenAutoGenerate={handleOpenAutoGenerate}
            onEditExam={handleEditExam}
            onViewHistory={handleViewHistory}
            onOpenStatusModal={handleOpenStatusModal}
            onOpenDeleteModal={handleOpenDeleteModal}
          />
        );
    }
  };

  // Screen title
  const screenTitles: Record<ActiveScreen, { title: string; sub: string }> = {
    list: { title: 'Quản lý Đề thi', sub: 'Tạo, chỉnh sửa và quản lý toàn bộ đề thi / bộ đề' },
    editor: { title: editingExam ? 'Chỉnh sửa Đề thi' : 'Tạo Đề thi Mới', sub: 'Cấu hình thông tin và danh sách câu hỏi' },
    'auto-generate': { title: 'Sinh Đề Tự Động', sub: 'Tạo đề ngẫu nhiên theo môn, độ khó và số câu từ ngân hàng' },
    history: { title: 'Lịch sử Chỉnh sửa', sub: `Audit trail cho: ${historyExam?.title || ''}` },
  };

  const currentTitle = screenTitles[screen];

  return (
    <div className="exam-shell">
      <Sidebar />

      <main className="exam-main">
        {/* Toast */}
        {toast && (
          <div className={`exam-toast is-${toast.type}`}>
            <span>{toast.type === 'success' ? '✅' : toast.type === 'danger' ? '❌' : 'ℹ️'}</span>
            {toast.msg}
          </div>
        )}

        {/* Topbar */}
        <div className="exam-topbar">
          <div className="exam-topbar-title">
            <h1>
              <span className="brand-accent">Brain Blitz</span> – {currentTitle.title}
            </h1>
            <p>{currentTitle.sub}</p>
          </div>

          {/* Nav tabs — chỉ hiện ở list screen */}
          {screen === 'list' && (
            <div className="exam-nav-tabs">
              <button className="exam-tab-btn is-active">📚 Tất cả</button>
              <button
                className="exam-tab-btn"
                onClick={() => handleFilterChange({ status: 'published' })}
              >
                🟢 Đã xuất bản
              </button>
              <button
                className="exam-tab-btn"
                onClick={() => handleFilterChange({ status: 'draft' })}
              >
                📝 Bản nháp
              </button>
              <button
                className="exam-tab-btn"
                onClick={() => handleFilterChange({ status: 'archived' })}
              >
                📦 Lưu trữ
              </button>
            </div>
          )}

          {/* Back button khi ở screen con */}
          {screen !== 'list' && (
            <button className="action-quick-btn outline" onClick={() => setScreen('list')}>
              ← Quay lại danh sách
            </button>
          )}
        </div>

        {/* Main content */}
        {renderScreen()}
      </main>

      {/* Status Modal */}
      {statusModalExam && (
        <StatusModal
          exam={statusModalExam}
          onConfirm={handleStatusChange}
          onClose={() => setStatusModalExam(null)}
        />
      )}

      {/* Delete Modal */}
      {deleteModalExam && (
        <DeleteModal
          exam={deleteModalExam}
          onConfirm={handleDelete}
          onClose={() => setDeleteModalExam(null)}
        />
      )}
    </div>
  );
};

export default ExamManagement;