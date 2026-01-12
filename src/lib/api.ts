import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('webToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Student {
  id: number;
  telegramUserId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}

export interface CourseWithProgress {
  id: number;
  title: string;
  description: string | null;
  enrollmentId: number;
  completedLessons: number;
  totalLessons: number;
  status: string;
}

export interface AvailableCourse {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  totalLessons: number;
}

export interface ModuleWithLessons {
  id: number;
  title: string;
  order: number;
  lessons: LessonWithStatus[];
}

export interface LessonWithStatus {
  id: number;
  title: string;
  type: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string | null;
  enrollmentId: number;
  completedLessons: number;
  totalLessons: number;
  modules: ModuleWithLessons[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  points: number;
}

export interface LessonDetail {
  id: number;
  title: string;
  type: string;
  description?: string;
  text?: string;
  videoUrl?: string;
  resources?: Array<{ type: string; label: string; url: string }>;
  questions?: QuizQuestion[];
  canPlayInWebapp: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface InitResponse {
  webToken: string;
  student: Student;
  botId: number;
  myCourses: CourseWithProgress[];
  availableCourses: AvailableCourse[];
}

export interface NextLessonResponse {
  lessonId: number | null;
  moduleId: number | null;
  locked?: boolean;
  unlockDate?: string;
}

export interface QuizResult {
  score: number;
  totalScore: number;
  percentage: number;
  results: Array<{
    questionIndex: number;
    selectedAnswer: number;
    correctAnswer: number;
    correct: boolean;
    points: number;
  }>;
  completedLessons: number;
  totalLessons: number;
  courseCompleted: boolean;
}

// ==================== SYLLABUS / OUTLINE TYPES ====================

export interface LessonOutlineItem {
  id: number;
  title: string;
  order: number;
  type: 'text' | 'video' | 'file' | 'quiz';
  status: 'locked' | 'not_started' | 'in_progress' | 'completed';
  isCurrent: boolean;
  canOpen: boolean;

  // quiz-specific
  isQuiz: boolean;
  attemptsUsed?: number;
  maxAttempts?: number | null;
  canRetake?: boolean;
  lastScore?: number | null;
  lastScorePercent?: number | null;
}

export interface ModuleOutlineItem {
  id: number;
  title: string;
  order: number;
  progressPercent: number;
  lessons: LessonOutlineItem[];
}

export interface CourseOutline {
  courseId: number;
  title: string;
  description?: string | null;
  totalLessons: number;
  completedLessons: number;
  completionPercent: number;
  currentLessonId: number | null;
  nextLessonId: number | null;

  allowRetakeQuiz: boolean;
  maxQuizAttempts: number | null;

  isDrip: boolean;
  dripIntervalDays: number | null;

  enrollmentStatus: 'none' | 'active' | 'blocked' | 'completed';
  modules: ModuleOutlineItem[];
}

export interface QuizRetakeResponse {
  success: boolean;
  lessonId: number;
  attemptsUsed: number;
  maxAttempts: number | null;
  canRetake: boolean;
}

export interface Certificate {
  id: number;
  courseId: number;
  courseTitle: string;
  certificateCode: string;
  completedAt: string;
  studentName: string;
}

// API functions
export const webappApi = {
  init: (botId: number, initData: string) =>
    api.post<InitResponse>(`/webapp/init/${botId}`, { initData }),

  getCourses: () =>
    api.get<{ myCourses: CourseWithProgress[]; availableCourses: AvailableCourse[] }>('/webapp/courses'),

  enroll: (courseId: number) =>
    api.post<{ enrollmentId: number; courseId: number; title: string }>('/webapp/enroll', { courseId }),

  getCourseDetail: (courseId: number) =>
    api.get<CourseDetail>(`/webapp/courses/${courseId}`),

  getNextLesson: (courseId: number) =>
    api.get<NextLessonResponse>(`/webapp/courses/${courseId}/next-lesson`),

  getLessonDetail: (courseId: number, lessonId: number) =>
    api.get<LessonDetail>(`/webapp/courses/${courseId}/lessons/${lessonId}`),

  completeLesson: (lessonId: number) =>
    api.post<{ completedLessons: number; totalLessons: number; courseCompleted: boolean }>(
      `/webapp/lessons/${lessonId}/complete`,
      {},
    ),

  submitQuiz: (lessonId: number, answers: number[]) =>
    api.post<QuizResult>(`/webapp/lessons/${lessonId}/quiz-submit`, { answers }),

  // Syllabus / Outline
  getCourseOutline: (courseId: number) =>
    api.get<CourseOutline>(`/webapp/courses/${courseId}/outline`),

  retakeQuiz: (lessonId: number) =>
    api.post<QuizRetakeResponse>(`/webapp/lessons/${lessonId}/quiz-retake`),

  // Request video to be sent to Telegram chat
  requestVideo: (lessonId: number) =>
    api.post<{ success: boolean; message: string }>(`/webapp/lessons/${lessonId}/request-video`),

  // Get student certificates
  getCertificates: () =>
    api.get<Certificate[]>('/webapp/certificates'),
};
