export type Difficulty = "de" | "trungbinh" | "kho";
export type MediaType = "image" | "audio" | "formula";
export type Status = "active" | "hidden";

export interface AnswerOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  content: string;
  subject: string;
  chapter: string;
  difficulty: Difficulty;
  options: AnswerOption[];
  explanation: string;
  media?: MediaType;
  status: Status;
  updatedAt: string;
}

export type SetStatus = "draft" | "published";

export interface ExamSet {
  id: string;
  title: string;
  subject: string;
  duration: number; // phút
  status: SetStatus;
  updatedAt: string;
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  de: "Dễ",
  trungbinh: "Trung bình",
  kho: "Khó",
};

export const SET_STATUS_LABEL: Record<SetStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
};

export const MEDIA_LABEL: Record<MediaType, string> = {
  image: "Hình ảnh",
  audio: "Âm thanh",
  formula: "Công thức",
};

/* ------------------------------- Mock data -------------------------------- */

export const initialQuestions: ExamQuestion[] = [
  {
    id: "q1",
    examId: "e1",
    content: "Đạo hàm của hàm số y = x³ − 3x² + 2 tại điểm x = 1 bằng bao nhiêu?",
    subject: "Toán",
    chapter: "Đạo hàm",
    difficulty: "trungbinh",
    options: [
      { id: "a", text: "−3", correct: true },
      { id: "b", text: "0", correct: false },
      { id: "c", text: "3", correct: false },
      { id: "d", text: "6", correct: false },
    ],
    explanation: "y' = 3x² − 6x, thay x = 1 ta có y'(1) = 3 − 6 = −3.",
    media: "formula",
    status: "active",
    updatedAt: "3 ngày trước",
  },
  {
    id: "q2",
    examId: "e2",
    content: "Trong thí nghiệm giao thoa ánh sáng Y-âng, khoảng vân được xác định bởi công thức nào?",
    subject: "Vật lý",
    chapter: "Sóng ánh sáng",
    difficulty: "kho",
    options: [
      { id: "a", text: "i = λD / a", correct: true },
      { id: "b", text: "i = aD / λ", correct: false },
      { id: "c", text: "i = λa / D", correct: false },
      { id: "d", text: "i = D / λa", correct: false },
    ],
    explanation: "Khoảng vân i = λD/a, với D là khoảng cách từ khe đến màn, a là khoảng cách hai khe.",
    media: "image",
    status: "active",
    updatedAt: "1 tuần trước",
  },
  {
    id: "q3",
    examId: "e3",
    content: "Dung dịch nào sau đây làm quỳ tím chuyển sang màu đỏ?",
    subject: "Hóa học",
    chapter: "Axit — Bazơ",
    difficulty: "de",
    options: [
      { id: "a", text: "NaOH", correct: false },
      { id: "b", text: "HCl", correct: true },
      { id: "c", text: "NaCl", correct: false },
      { id: "d", text: "H₂O", correct: false },
    ],
    explanation: "HCl là axit mạnh, làm quỳ tím chuyển đỏ.",
    status: "active",
    updatedAt: "2 tuần trước",
  },
  {
    id: "q4",
    examId: "e1",
    content: "Cho hình chóp S.ABCD có đáy là hình vuông cạnh a, SA vuông góc với đáy. Tính thể tích khối chóp theo a khi SA = a.",
    subject: "Toán",
    chapter: "Thể tích khối chóp",
    difficulty: "kho",
    options: [
      { id: "a", text: "a³/3", correct: true },
      { id: "b", text: "a³/6", correct: false },
      { id: "c", text: "a³", correct: false },
      { id: "d", text: "a³/2", correct: false },
    ],
    explanation: "V = 1/3 · S_đáy · h = 1/3 · a² · a = a³/3.",
    media: "image",
    status: "hidden",
    updatedAt: "1 tháng trước",
  },
  {
    id: "q5",
    examId: "e2",
    content: "Từ trường của một dòng điện thẳng dài vô hạn có đặc điểm gì tại các điểm cách đều dây dẫn?",
    subject: "Vật lý",
    chapter: "Từ trường",
    difficulty: "trungbinh",
    options: [
      { id: "a", text: "Có độ lớn bằng nhau, đường sức là các đường tròn đồng tâm", correct: true },
      { id: "b", text: "Có độ lớn khác nhau tùy hướng", correct: false },
      { id: "c", text: "Bằng không", correct: false },
      { id: "d", text: "Chỉ tồn tại theo phương vuông góc với dây", correct: false },
    ],
    explanation: "Cảm ứng từ B = 2.10⁻⁷ I/r, không đổi tại các điểm cách đều dây, đường sức là đường tròn đồng tâm.",
    status: "active",
    updatedAt: "5 ngày trước",
  },
  {
    id: "q6",
    examId: "e4",
    content: "Nghe đoạn hội thoại và chọn đáp án đúng: người nói đang đề nghị điều gì?",
    subject: "Tiếng Anh",
    chapter: "Nghe hiểu",
    difficulty: "de",
    options: [
      { id: "a", text: "A meeting on Monday", correct: false },
      { id: "b", text: "A meeting on Friday", correct: true },
      { id: "c", text: "A phone call", correct: false },
      { id: "d", text: "An email", correct: false },
    ],
    explanation: "Trong đoạn hội thoại, người nói đề xuất dời cuộc họp sang thứ Sáu.",
    media: "audio",
    status: "active",
    updatedAt: "6 giờ trước",
  },
];

export const initialExamSets: ExamSet[] = [
  { id: "e1", title: "Đề kiểm tra giữa kỳ", subject: "Toán", duration: 45, status: "published", updatedAt: "3 ngày trước" },
  { id: "e2", title: "Đề ôn tập 15 phút", subject: "Vật lý", duration: 15, status: "published", updatedAt: "5 ngày trước" },
  { id: "e3", title: "Đề chương Axit — Bazơ", subject: "Hóa học", duration: 30, status: "draft", updatedAt: "2 tuần trước" },
  { id: "e4", title: "Đề nghe hiểu số 1", subject: "Tiếng Anh", duration: 20, status: "draft", updatedAt: "6 giờ trước" },
];

export const SUBJECTS = ["Tất cả", "Toán", "Vật lý", "Hóa học", "Tiếng Anh"];
export const DIFFICULTIES: Array<{ value: "all" | Difficulty; label: string }> = [
  { value: "all", label: "Tất cả độ khó" },
  { value: "de", label: "Dễ" },
  { value: "trungbinh", label: "Trung bình" },
  { value: "kho", label: "Khó" },
];


export type AttemptStatus = "in_progress" | "submitted";

export interface ExamAttempt {
  id: string;
  examId: string;
  learnerName: string;
  answers: Record<string, string>; // questionId -> optionId
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string;
  correctCount?: number;
  total?: number;
  scoreOn10?: number;
}
