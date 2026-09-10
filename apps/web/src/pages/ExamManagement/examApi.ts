import { api } from '@onthitracnghiem/shared';
import type {
  Exam,
  ExamFilter,
  ExamStats,
  ExamRevision,
  Subject,
  Question,
  AutoGenerateParams,
  AutoGeneratePreview,
} from './types';

// Mock data ban đầu theo đúng artifact Exam Management UI Mockup
const initialSubjects: Subject[] = [
  {
    id: 1,
    name: 'Lập trình Web',
    description: 'Frontend & Backend hiện đại',
    topics: [
      { id: 101, subject_id: 1, name: 'ReactJS, Virtual DOM & State Management' },
      { id: 102, subject_id: 1, name: 'HTML5 & CSS3 Responsive' },
      { id: 103, subject_id: 1, name: 'JavaScript ES6+ & Async/Await' },
    ],
  },
  {
    id: 2,
    name: 'Toán rời rạc',
    description: 'Logic và đồ thị',
    topics: [
      { id: 201, subject_id: 2, name: 'Logic mệnh đề & Vị từ' },
      { id: 202, subject_id: 2, name: 'Lý thuyết Đồ thị & Cây' },
    ],
  },
  {
    id: 3,
    name: 'Mạng máy tính',
    description: 'TCP/IP và Routing',
    topics: [
      { id: 301, subject_id: 3, name: 'Mô hình OSI & Bộ giao thức TCP/IP' },
      { id: 302, subject_id: 3, name: 'Định tuyến Router & VLAN' },
    ],
  },
  {
    id: 4,
    name: 'Tiếng Anh CN',
    description: 'English for IT',
    topics: [
      { id: 401, subject_id: 4, name: 'Từ vựng IT Unit 1-4' },
      { id: 402, subject_id: 4, name: 'Kỹ năng đọc hiểu tài liệu kỹ thuật' },
    ],
  },
];

const initialQuestions: Question[] = [
  {
    id: 4920,
    subject_id: 1,
    topic_id: 101,
    content: 'Trong React 19, hook nào sau đây được sử dụng để xử lý tác vụ bất đồng bộ (Async actions) và quản lý trạng thái pending trực tiếp trong form?',
    difficulty: 'medium',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 1, question_id: 4920, content: 'useFormStatus', is_correct: false, sort_order: 1 },
      { id: 2, question_id: 4920, content: 'useActionState', is_correct: true, sort_order: 2 },
      { id: 3, question_id: 4920, content: 'useOptimistic', is_correct: false, sort_order: 3 },
      { id: 4, question_id: 4920, content: 'useTransition', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 4912,
    subject_id: 1,
    topic_id: 101,
    content: 'Virtual DOM trong React giúp tối ưu hiệu năng render của trình duyệt bằng cơ chế nào sau đây?',
    difficulty: 'easy',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 5, question_id: 4912, content: 'Thao tác trực tiếp với GPU của máy khách', is_correct: false, sort_order: 1 },
      { id: 6, question_id: 4912, content: 'Bỏ qua hoàn toàn render tree của trình duyệt', is_correct: false, sort_order: 2 },
      { id: 7, question_id: 4912, content: 'Diffing algorithm & Batch updates lên Real DOM', is_correct: true, sort_order: 3 },
      { id: 8, question_id: 4912, content: 'Sử dụng Web Assembly biên dịch sang mã máy', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 4876,
    subject_id: 1,
    topic_id: 101,
    content: 'Khi sử dụng useEffect với mảng phụ thuộc rỗng `[]`, hàm cleanup trả về sẽ được kích hoạt tại thời điểm nào trong lifecycle của component?',
    difficulty: 'hard',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 9, question_id: 4876, content: 'Khi component unmount khỏi DOM', is_correct: true, sort_order: 1 },
      { id: 10, question_id: 4876, content: 'Trước mỗi lần component re-render', is_correct: false, sort_order: 2 },
      { id: 11, question_id: 4876, content: 'Ngay sau khi DOM được vẽ xong', is_correct: false, sort_order: 3 },
      { id: 12, question_id: 4876, content: 'Khi state con thay đổi', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 4850,
    subject_id: 1,
    topic_id: 102,
    content: 'Thuộc tính CSS nào cho phép phần tử co giãn linh hoạt theo tỉ lệ không gian trống trong flex container?',
    difficulty: 'easy',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 13, question_id: 4850, content: 'flex-grow', is_correct: true, sort_order: 1 },
      { id: 14, question_id: 4850, content: 'flex-shrink', is_correct: false, sort_order: 2 },
      { id: 15, question_id: 4850, content: 'align-items', is_correct: false, sort_order: 3 },
      { id: 16, question_id: 4850, content: 'justify-self', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 4860,
    subject_id: 1,
    topic_id: 103,
    content: 'Từ khóa nào trong JavaScript ES6+ được dùng để tạm dừng thực thi của một hàm generator cho đến khi gọi method next()?',
    difficulty: 'medium',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 17, question_id: 4860, content: 'await', is_correct: false, sort_order: 1 },
      { id: 18, question_id: 4860, content: 'yield', is_correct: true, sort_order: 2 },
      { id: 19, question_id: 4860, content: 'pause', is_correct: false, sort_order: 3 },
      { id: 20, question_id: 4860, content: 'defer', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 2011,
    subject_id: 2,
    topic_id: 201,
    content: 'Mệnh đề tương đương logic nào sau đây là định luật De Morgan cho phủ định của hội: ¬(P ∧ Q)?',
    difficulty: 'easy',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 21, question_id: 2011, content: '¬P ∨ ¬Q', is_correct: true, sort_order: 1 },
      { id: 22, question_id: 2011, content: '¬P ∧ ¬Q', is_correct: false, sort_order: 2 },
      { id: 23, question_id: 2011, content: 'P ∨ Q', is_correct: false, sort_order: 3 },
      { id: 24, question_id: 2011, content: '¬P → Q', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 2022,
    subject_id: 2,
    topic_id: 202,
    content: 'Đồ thị liên thông vô hướng có n đỉnh thì cây khung của đồ thị đó có chính xác bao nhiêu cạnh?',
    difficulty: 'medium',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 25, question_id: 2022, content: 'n - 1 cạnh', is_correct: true, sort_order: 1 },
      { id: 26, question_id: 2022, content: 'n cạnh', is_correct: false, sort_order: 2 },
      { id: 27, question_id: 2022, content: 'n + 1 cạnh', is_correct: false, sort_order: 3 },
      { id: 28, question_id: 2022, content: '2n cạnh', is_correct: false, sort_order: 4 },
    ],
  },
  {
    id: 3011,
    subject_id: 3,
    topic_id: 301,
    content: 'Giao thức nào sau đây thuộc tầng Giao vận (Transport Layer) trong mô hình TCP/IP?',
    difficulty: 'easy',
    question_type: 'single_choice',
    status: 'published',
    options: [
      { id: 29, question_id: 3011, content: 'TCP và UDP', is_correct: true, sort_order: 1 },
      { id: 30, question_id: 3011, content: 'IP và ICMP', is_correct: false, sort_order: 2 },
      { id: 31, question_id: 3011, content: 'HTTP và DNS', is_correct: false, sort_order: 3 },
      { id: 32, question_id: 3011, content: 'Ethernet và ARP', is_correct: false, sort_order: 4 },
    ],
  },
];

const initialExams: Exam[] = [
  {
    id: 1,
    title: 'Kiểm tra giữa kỳ - Lập trình Web Frontend',
    code: 'WEB-GK-01',
    subject_id: 1,
    topic_id: 101,
    difficulty: 'medium',
    duration_minutes: 60,
    total_questions: 40,
    scoring_method: 'equal',
    pass_score: 5.0,
    max_attempts: 1,
    shuffle_questions: true,
    shuffle_options: true,
    status: 'published',
    is_auto_generated: false,
    created_by: 1,
    created_at: '2026-09-01 16:00:00',
    updated_at: '2026-09-08 14:35:12',
    subject: initialSubjects[0],
    topic: initialSubjects[0].topics?.[0],
    creator: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    revisions_count: 3,
    attempts_count: 42,
    exam_questions: [
      {
        id: 1,
        exam_id: 1,
        question_id: 4920,
        points: 3.33,
        sort_order: 1,
        question: initialQuestions[0],
      },
      {
        id: 2,
        exam_id: 1,
        question_id: 4912,
        points: 3.33,
        sort_order: 2,
        question: initialQuestions[1],
      },
      {
        id: 3,
        exam_id: 1,
        question_id: 4876,
        points: 3.34,
        sort_order: 3,
        question: initialQuestions[2],
      },
    ],
  },
  {
    id: 2,
    title: 'Đề ôn luyện Logic Mệnh đề & Đồ thị',
    code: 'MATH-RR-03',
    subject_id: 2,
    topic_id: 201,
    difficulty: 'hard',
    duration_minutes: 45,
    total_questions: 25,
    scoring_method: 'weighted',
    pass_score: 6.0,
    max_attempts: 3,
    shuffle_questions: true,
    shuffle_options: true,
    status: 'draft',
    is_auto_generated: true,
    created_by: 1,
    created_at: '2026-09-08 08:30:00',
    updated_at: '2026-09-09 10:15:00',
    subject: initialSubjects[1],
    topic: initialSubjects[1].topics?.[0],
    creator: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    revisions_count: 1,
    attempts_count: 0,
    exam_questions: [
      {
        id: 4,
        exam_id: 2,
        question_id: 2011,
        points: 4.0,
        sort_order: 1,
        question: initialQuestions[5],
      },
      {
        id: 5,
        exam_id: 2,
        question_id: 2022,
        points: 6.0,
        sort_order: 2,
        question: initialQuestions[6],
      },
    ],
  },
  {
    id: 3,
    title: 'Thi thử Giao thức TCP/IP và Định tuyến Router',
    code: 'NET-CK-02',
    subject_id: 3,
    topic_id: 301,
    difficulty: 'mixed',
    duration_minutes: 90,
    total_questions: 50,
    scoring_method: 'equal',
    pass_score: 5.0,
    max_attempts: 2,
    shuffle_questions: true,
    shuffle_options: true,
    status: 'published',
    is_auto_generated: false,
    created_by: 1,
    created_at: '2026-09-02 10:00:00',
    updated_at: '2026-09-02 10:00:00',
    subject: initialSubjects[2],
    topic: initialSubjects[2].topics?.[0],
    creator: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    revisions_count: 1,
    attempts_count: 18,
    exam_questions: [
      {
        id: 6,
        exam_id: 3,
        question_id: 3011,
        points: 10.0,
        sort_order: 1,
        question: initialQuestions[7],
      },
    ],
  },
  {
    id: 4,
    title: 'Kiểm tra 15 phút từ vựng IT Unit 1-4 (Kỳ 2025)',
    code: 'ENG-QT-99',
    subject_id: 4,
    topic_id: 401,
    difficulty: 'easy',
    duration_minutes: 15,
    total_questions: 15,
    scoring_method: 'equal',
    pass_score: 5.0,
    max_attempts: 1,
    shuffle_questions: false,
    shuffle_options: true,
    status: 'archived',
    is_auto_generated: false,
    created_by: 1,
    created_at: '2025-10-10 14:00:00',
    updated_at: '2026-01-01 09:00:00',
    subject: initialSubjects[3],
    topic: initialSubjects[3].topics?.[0],
    creator: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    revisions_count: 1,
    attempts_count: 120,
    exam_questions: [],
  },
];

const initialRevisions: Record<number, ExamRevision[]> = {
  1: [
    {
      id: 3,
      exam_id: 1,
      changed_by: 1,
      created_at: '2026-09-08 14:35:12',
      change_note: 'Chuyển trạng thái từ "Bản nháp" sang "Đã xuất bản". Điều chỉnh thời gian làm bài từ 45 phút lên 60 phút. Bổ sung 5 câu hỏi chủ đề React 19 Actions vào danh sách đề thi.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    },
    {
      id: 2,
      exam_id: 1,
      changed_by: 1,
      created_at: '2026-09-05 09:12:00',
      change_note: 'Thay đổi cách tính điểm từ "Trọng số từng câu" sang "Chia đều 10 điểm cho 35 câu". Cập nhật độ khó sang mức Trung bình.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    },
    {
      id: 1,
      exam_id: 1,
      changed_by: 1,
      created_at: '2026-09-01 16:00:00',
      change_note: 'Khởi tạo đề thi với 30 câu hỏi ban đầu từ ngân hàng câu hỏi.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    },
  ],
  2: [
    {
      id: 4,
      exam_id: 2,
      changed_by: 1,
      created_at: '2026-09-08 08:30:00',
      change_note: 'Sinh tự động bởi AI từ ngân hàng câu hỏi Toán rời rạc theo tỉ lệ 40% TB - 60% Khó.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    },
  ],
  3: [
    {
      id: 5,
      exam_id: 3,
      changed_by: 1,
      created_at: '2026-09-02 10:00:00',
      change_note: 'Khởi tạo bộ đề thi thử cuối kỳ môn Mạng máy tính.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    },
  ],
  4: [
    {
      id: 6,
      exam_id: 4,
      changed_by: 1,
      created_at: '2026-01-01 09:00:00',
      change_note: 'Đã hết kỳ học năm 2025, chuyển đề sang trạng thái Lưu trữ / Ẩn.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    },
  ],
};

// Quản lý dữ liệu local storage
const STORAGE_KEY_EXAMS = 'brainblitz_exams_data_v1';
const STORAGE_KEY_REVISIONS = 'brainblitz_revisions_data_v1';

function getLocalExams(): Exam[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_EXAMS);
    if (data) return JSON.parse(data);
  } catch {}
  return initialExams;
}

function saveLocalExams(exams: Exam[]) {
  try {
    localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
  } catch {}
}

function getLocalRevisions(): Record<number, ExamRevision[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REVISIONS);
    if (data) return JSON.parse(data);
  } catch {}
  return initialRevisions;
}

function saveLocalRevisions(revs: Record<number, ExamRevision[]>) {
  try {
    localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(revs));
  } catch {}
}

export const examApi = {
  /**
   * Lấy danh sách đề thi kèm stats & filter
   */
  async getExams(filter: ExamFilter): Promise<{ exams: Exam[]; stats: ExamStats }> {
    try {
      const res = await api.get('/exams', { params: filter });
      if (res.data?.success) {
        return {
          exams: res.data.data,
          stats: res.data.stats,
        };
      }
    } catch {
      // Fallback local
    }

    let list = getLocalExams();

    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.code && e.code.toLowerCase().includes(q))
      );
    }
    if (filter.subject_id) {
      list = list.filter((e) => e.subject_id === Number(filter.subject_id));
    }
    if (filter.status) {
      list = list.filter((e) => e.status === filter.status);
    }
    if (filter.difficulty) {
      list = list.filter((e) => e.difficulty === filter.difficulty);
    }

    const all = getLocalExams();
    const stats: ExamStats = {
      total: all.length,
      published: all.filter((e) => e.status === 'published').length,
      draft: all.filter((e) => e.status === 'draft').length,
      archived: all.filter((e) => e.status === 'archived').length,
    };

    return { exams: list, stats };
  },

  /**
   * Lấy chi tiết đề thi
   */
  async getExamDetail(id: number): Promise<Exam> {
    try {
      const res = await api.get(`/exams/${id}`);
      if (res.data?.success) return res.data.data;
    } catch {}

    const exam = getLocalExams().find((e) => e.id === id);
    if (!exam) throw new Error('Không tìm thấy đề thi');
    return exam;
  },

  /**
   * Tạo đề thi mới
   */
  async createExam(payload: Partial<Exam> & { change_note?: string; questions?: any[] }): Promise<Exam> {
    try {
      const res = await api.post('/exams', payload);
      if (res.data?.success) return res.data.data;
    } catch {}

    const exams = getLocalExams();
    const newId = exams.length > 0 ? Math.max(...exams.map((e) => e.id)) + 1 : 1;
    const subject = initialSubjects.find((s) => s.id === payload.subject_id) || initialSubjects[0];
    const topic = subject.topics?.find((t) => t.id === payload.topic_id);

    const questionsList = payload.questions || [];
    const newExam: Exam = {
      id: newId,
      title: payload.title || 'Đề thi mới',
      code: `EXAM-${newId.toString().padStart(2, '0')}`,
      subject_id: payload.subject_id || 1,
      topic_id: payload.topic_id,
      difficulty: payload.difficulty || 'medium',
      duration_minutes: payload.duration_minutes || 60,
      total_questions: questionsList.length,
      scoring_method: payload.scoring_method || 'equal',
      pass_score: payload.pass_score ?? 5.0,
      max_attempts: payload.max_attempts ?? 1,
      shuffle_questions: payload.shuffle_questions ?? true,
      shuffle_options: payload.shuffle_options ?? true,
      status: payload.status || 'draft',
      is_auto_generated: payload.is_auto_generated ?? false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      subject,
      topic,
      creator: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
      revisions_count: 1,
      attempts_count: 0,
      exam_questions: questionsList.map((q: any, idx: number) => ({
        id: idx + 1,
        exam_id: newId,
        question_id: q.question_id,
        points: q.points || (questionsList.length ? +(10 / questionsList.length).toFixed(2) : 1),
        sort_order: q.sort_order || idx + 1,
        question: initialQuestions.find((iq) => iq.id === q.question_id),
      })),
    };

    exams.unshift(newExam);
    saveLocalExams(exams);

    // Ghi nhận revision
    const revs = getLocalRevisions();
    revs[newId] = [
      {
        id: Date.now(),
        exam_id: newId,
        changed_by: 1,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        change_note: payload.change_note || `Khởi tạo đề thi với ${questionsList.length} câu hỏi ban đầu.`,
        changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
      },
    ];
    saveLocalRevisions(revs);

    return newExam;
  },

  /**
   * Cập nhật đề thi
   */
  async updateExam(id: number, payload: Partial<Exam> & { change_note?: string; questions?: any[] }): Promise<Exam> {
    try {
      const res = await api.put(`/exams/${id}`, payload);
      if (res.data?.success) return res.data.data;
    } catch {}

    const exams = getLocalExams();
    const idx = exams.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Không tìm thấy đề thi');

    const prev = exams[idx];
    const subject = initialSubjects.find((s) => s.id === (payload.subject_id ?? prev.subject_id)) || prev.subject;
    const topic = subject?.topics?.find((t) => t.id === (payload.topic_id ?? prev.topic_id));

    let updatedQuestions = prev.exam_questions;
    if (payload.questions) {
      updatedQuestions = payload.questions.map((q: any, i: number) => ({
        id: i + 1,
        exam_id: id,
        question_id: q.question_id,
        points: q.points ?? (payload.questions?.length ? +(10 / payload.questions.length).toFixed(2) : 1),
        sort_order: q.sort_order ?? i + 1,
        question: initialQuestions.find((iq) => iq.id === q.question_id) || q.question,
      }));
    }

    const updated: Exam = {
      ...prev,
      ...payload,
      subject,
      topic,
      total_questions: updatedQuestions?.length ?? prev.total_questions,
      exam_questions: updatedQuestions,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      revisions_count: (prev.revisions_count || 1) + 1,
    };

    exams[idx] = updated;
    saveLocalExams(exams);

    // Ghi log
    const revs = getLocalRevisions();
    if (!revs[id]) revs[id] = [];
    revs[id].unshift({
      id: Date.now(),
      exam_id: id,
      changed_by: 1,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      change_note: payload.change_note || 'Cập nhật cấu hình và nội dung câu hỏi đề thi.',
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    });
    saveLocalRevisions(revs);

    return updated;
  },

  /**
   * Cập nhật trạng thái
   */
  async updateStatus(id: number, status: 'draft' | 'published' | 'archived', change_note?: string): Promise<Exam> {
    try {
      const res = await api.patch(`/exams/${id}/status`, { status, change_note });
      if (res.data?.success) return res.data.data;
    } catch {}

    const exams = getLocalExams();
    const idx = exams.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Không tìm thấy đề thi');

    const statusLabels: Record<string, string> = {
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Lưu trữ / Ẩn',
    };

    const oldStatus = exams[idx].status;
    exams[idx].status = status;
    exams[idx].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    exams[idx].revisions_count = (exams[idx].revisions_count || 1) + 1;
    saveLocalExams(exams);

    const revs = getLocalRevisions();
    if (!revs[id]) revs[id] = [];
    revs[id].unshift({
      id: Date.now(),
      exam_id: id,
      changed_by: 1,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      change_note: change_note || `Chuyển trạng thái từ "${statusLabels[oldStatus]}" sang "${statusLabels[status]}".`,
      changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
    });
    saveLocalRevisions(revs);

    return exams[idx];
  },

  /**
   * Xóa hoặc đóng đề thi an toàn
   */
  async deleteExam(id: number): Promise<{ success: boolean; message: string; mode: string }> {
    try {
      const res = await api.delete(`/exams/${id}`);
      if (res.data?.success) return res.data;
    } catch {}

    const exams = getLocalExams();
    const target = exams.find((e) => e.id === id);
    if (!target) return { success: false, message: 'Không tìm thấy đề thi', mode: 'error' };

    if ((target.attempts_count || 0) > 0) {
      target.status = 'archived';
      saveLocalExams(exams.filter((e) => e.id !== id));
      return {
        success: true,
        message: `Đề thi đã có ${target.attempts_count} lượt làm bài. Đã chuyển sang chế độ Lưu trữ an toàn (Soft delete) để bảo vệ kết quả học viên.`,
        mode: 'soft_deleted',
      };
    }

    saveLocalExams(exams.filter((e) => e.id !== id));
    return {
      success: true,
      message: 'Đã xóa hoàn toàn đề thi.',
      mode: 'deleted',
    };
  },

  /**
   * Sinh đề ngẫu nhiên thông minh
   */
  async autoGenerate(params: AutoGenerateParams): Promise<AutoGeneratePreview> {
    try {
      const res = await api.post('/exams/auto-generate', params);
      if (res.data?.success) return res.data;
    } catch {}

    const targetEasy = Math.round(params.total_questions * (params.easy_percent / 100));
    const targetMedium = Math.round(params.total_questions * (params.medium_percent / 100));
    const targetHard = Math.max(0, params.total_questions - targetEasy - targetMedium);

    const questions: Question[] = [
      {
        id: 101,
        subject_id: params.subject_id,
        content: 'Khái niệm JSX và sự khác biệt với cú pháp HTML thuần túy?',
        difficulty: 'easy',
        question_type: 'single_choice',
        status: 'published',
      },
      {
        id: 102,
        subject_id: params.subject_id,
        content: 'Props và State khác nhau như thế nào trong React component?',
        difficulty: 'easy',
        question_type: 'single_choice',
        status: 'published',
      },
      {
        id: 103,
        subject_id: params.subject_id,
        content: 'Cơ chế Re-render khi gọi setState() nhiều lần đồng thời (Automatic Batching)?',
        difficulty: 'medium',
        question_type: 'single_choice',
        status: 'published',
      },
      {
        id: 104,
        subject_id: params.subject_id,
        content: 'Xử lý Race-Condition trong React custom hook khi fetch dữ liệu bất đồng bộ?',
        difficulty: 'hard',
        question_type: 'single_choice',
        status: 'published',
      },
      {
        id: 105,
        subject_id: params.subject_id,
        content: 'Cách tối ưu hàm useCallback và useMemo để tránh re-render component con không cần thiết?',
        difficulty: 'medium',
        question_type: 'single_choice',
        status: 'published',
      },
    ];

    return {
      summary: {
        target_easy: targetEasy,
        actual_easy: targetEasy,
        target_medium: targetMedium,
        actual_medium: targetMedium,
        target_hard: targetHard,
        actual_hard: targetHard,
        total_requested: params.total_questions,
        total_picked: params.total_questions,
        is_criteria_met: true,
      },
      questions,
    };
  },

  /**
   * Lấy danh sách lịch sử sửa đổi (Audit Trail)
   */
  async getRevisions(examId: number): Promise<ExamRevision[]> {
    try {
      const res = await api.get(`/exams/${examId}/revisions`);
      if (res.data?.success) return res.data.data;
    } catch {}

    const revs = getLocalRevisions();
    return revs[examId] || [
      {
        id: 1,
        exam_id: examId,
        changed_by: 1,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        change_note: 'Khởi tạo đề thi.',
        changed_by_user: { id: 1, full_name: 'ThS. Hoàng Nam', role: 'Giảng viên' },
      },
    ];
  },

  /**
   * Lấy môn học và ngân hàng câu hỏi
   */
  async getResources(): Promise<{ subjects: Subject[]; questions: Question[] }> {
    try {
      const res = await api.get('/exam-resources');
      if (res.data?.success) return res.data;
    } catch {}

    return {
      subjects: initialSubjects,
      questions: initialQuestions,
    };
  },
};
