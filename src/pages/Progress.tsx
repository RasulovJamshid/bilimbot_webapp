import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { webappApi } from '../lib/api';
import type { CourseWithProgress } from '../lib/api';
import { getTelegramWebApp } from '../lib/telegram';
import { BarChart3, BookOpen, CheckCircle, Clock, Trophy, Loader2, AlertCircle } from 'lucide-react';
import './Progress.css';

interface ProgressStats {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  overallProgress: number;
}

export function Progress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);

  useEffect(() => {
    loadProgress();

    const tg = getTelegramWebApp();
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/'));
    }

    return () => {
      if (tg) {
        tg.BackButton.hide();
        tg.BackButton.offClick(() => navigate('/'));
      }
    };
  }, [navigate]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await webappApi.getCourses();
      const myCourses = response.data.myCourses;
      setCourses(myCourses);

      // Calculate statistics
      const totalCourses = myCourses.length;
      const completedCourses = myCourses.filter(c => c.status === 'completed').length;
      const activeCourses = myCourses.filter(c => c.status === 'active').length;
      
      const totalLessons = myCourses.reduce((sum, c) => sum + c.totalLessons, 0);
      const completedLessons = myCourses.reduce((sum, c) => sum + c.completedLessons, 0);
      const inProgressLessons = myCourses.reduce((sum, c) => {
        const progress = c.completedLessons;
        return sum + (progress > 0 && progress < c.totalLessons ? 1 : 0);
      }, 0);

      const overallProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;

      setStats({
        totalCourses,
        activeCourses,
        completedCourses,
        totalLessons,
        completedLessons,
        inProgressLessons,
        overallProgress,
      });
    } catch (err) {
      console.error('Failed to load progress:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getProgressBar = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return (
      <div className="progress-bar-container">
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="progress-percentage">{Math.round(percentage)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner-icon" size={48} />
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} className="error-icon" />
        <p className="error-text">{error}</p>
        <button className="retry-button" onClick={loadProgress}>
          Try Again
        </button>
      </div>
    );
  }

  if (!stats || courses.length === 0) {
    return (
      <div className="empty-container">
        <BookOpen size={64} className="empty-icon" />
        <h2>No Courses Yet</h2>
        <p>Enroll in a course to start tracking your progress</p>
        <button className="browse-button" onClick={() => navigate('/')}>
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <h1 className="progress-title">My Progress</h1>

      {/* Overall Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeCourses}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedCourses}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon trophy">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedLessons}</div>
            <div className="stat-label">Lessons Done</div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="overall-progress-section">
        <div className="section-header">
          <BarChart3 size={20} />
          <h2>Overall Progress</h2>
        </div>
        <div className="overall-progress-card">
          <div className="overall-progress-circle">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--tg-theme-secondary-bg-color, #e0e0e0)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--tg-theme-button-color, #0088cc)"
                strokeWidth="10"
                strokeDasharray={`${stats.overallProgress * 2.827} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="circle-text">
              <div className="circle-percentage">{stats.overallProgress}%</div>
              <div className="circle-label">Complete</div>
            </div>
          </div>
          <div className="overall-stats">
            <div className="overall-stat-item">
              <span className="stat-number">{stats.completedLessons}</span>
              <span className="stat-text">of {stats.totalLessons} lessons completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="course-progress-section">
        <div className="section-header">
          <BookOpen size={20} />
          <h2>Course Details</h2>
        </div>
        <div className="course-progress-list">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="course-progress-card"
              onClick={() => navigate(`/courses/${course.id}/syllabus`)}
            >
              <div className="course-progress-header">
                <h3 className="course-progress-title">{course.title}</h3>
                {course.status === 'completed' && (
                  <div className="completed-badge">
                    <CheckCircle size={16} />
                    Completed
                  </div>
                )}
              </div>
              {course.description && (
                <p className="course-progress-description">{course.description}</p>
              )}
              <div className="course-progress-stats">
                <span className="lessons-count">
                  {course.completedLessons} / {course.totalLessons} lessons
                </span>
              </div>
              {getProgressBar(course.completedLessons, course.totalLessons)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
