import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { webappApi } from '../lib/api';
import type { Student, CourseWithProgress, AvailableCourse } from '../lib/api';
import { getInitData, getBotIdFromUrl, initTelegramWebApp } from '../lib/telegram';

interface AppState {
  loading: boolean;
  error: string | null;
  student: Student | null;
  botId: number | null;
  myCourses: CourseWithProgress[];
  availableCourses: AvailableCourse[];
  refreshCourses: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [botId, setBotId] = useState<number | null>(null);
  const [myCourses, setMyCourses] = useState<CourseWithProgress[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);

  useEffect(() => {
    initTelegramWebApp();
    initApp();
  }, []);

  const initApp = async () => {
    try {
      setLoading(true);
      setError(null);

      const initData = getInitData();
      const botIdFromUrl = getBotIdFromUrl();

      if (!initData) {
        setError('No Telegram initData found. Please open this app from Telegram.');
        setLoading(false);
        return;
      }

      if (!botIdFromUrl) {
        setError('No botId found in URL.');
        setLoading(false);
        return;
      }

      const response = await webappApi.init(botIdFromUrl, initData);
      const data = response.data;

      // Store token
      sessionStorage.setItem('webToken', data.webToken);

      setStudent(data.student);
      setBotId(data.botId);
      setMyCourses(data.myCourses);
      setAvailableCourses(data.availableCourses);
    } catch (err: unknown) {
      console.error('Init error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize app';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshCourses = async () => {
    try {
      const response = await webappApi.getCourses();
      setMyCourses(response.data.myCourses);
      setAvailableCourses(response.data.availableCourses);
    } catch (err) {
      console.error('Failed to refresh courses:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        error,
        student,
        botId,
        myCourses,
        availableCourses,
        refreshCourses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
