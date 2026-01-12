import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { webappApi } from '../lib/api';
import type { CourseOutline, LessonOutlineItem } from '../lib/api';
import { getTelegramWebApp } from '../lib/telegram';
import { Lock, CheckCircle, Clock, Circle, FileText, Video, Paperclip, HelpCircle, Loader2, Play, ChevronDown, ChevronRight } from 'lucide-react';
import './Syllabus.css';

export function Syllabus() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadOutline();

    // Setup back button
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
  }, [courseId, navigate]);

  const loadOutline = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const response = await webappApi.getCourseOutline(parseInt(courseId));
      setOutline(response.data);
      
      // Expand all modules by default
      const moduleIds = new Set(response.data.modules.map(m => m.id));
      setExpandedModules(moduleIds);
    } catch (err) {
      console.error('Failed to load outline:', err);
      setError('Failed to load course outline');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    if (!outline || !outline.currentLessonId) return;
    navigate(`/courses/${courseId}/lessons/${outline.currentLessonId}`);
  };

  const handleLessonClick = (lesson: LessonOutlineItem) => {
    const tg = getTelegramWebApp();
    
    if (!lesson.canOpen) {
      if (lesson.status === 'locked') {
        tg?.showAlert('This lesson is locked. Complete previous lessons or wait for the scheduled unlock.');
      } else {
        tg?.showAlert('You cannot access this lesson yet.');
      }
      return;
    }

    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
  };

  const getStatusIcon = (lesson: LessonOutlineItem) => {
    const size = 18;
    if (lesson.status === 'locked') return <Lock size={size} className="status-icon locked" />;
    if (lesson.status === 'completed') return <CheckCircle size={size} className="status-icon completed" />;
    if (lesson.status === 'in_progress') return <Clock size={size} className="status-icon in-progress" />;
    return <Circle size={size} className="status-icon not-started" />;
  };

  const getTypeIcon = (type: string) => {
    const size = 16;
    switch (type) {
      case 'text': return <FileText size={size} className="type-icon" />;
      case 'video': return <Video size={size} className="type-icon" />;
      case 'file': return <Paperclip size={size} className="type-icon" />;
      case 'quiz': return <HelpCircle size={size} className="type-icon" />;
      default: return <FileText size={size} className="type-icon" />;
    }
  };

  const getCurrentLessonTitle = () => {
    if (!outline || !outline.currentLessonId) return null;
    
    for (const module of outline.modules) {
      const lesson = module.lessons.find(l => l.id === outline.currentLessonId);
      if (lesson) return lesson.title;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner-icon" size={48} />
        <p>Loading syllabus...</p>
      </div>
    );
  }

  if (error || !outline) {
    return (
      <div className="error-container">
        <p className="error-text">{error || 'Course not found'}</p>
      </div>
    );
  }

  const currentLessonTitle = getCurrentLessonTitle();

  return (
    <div className="syllabus-page">
      {/* Header */}
      <div className="syllabus-header">
        <h1 className="course-title">{outline.title}</h1>
        {outline.description && (
          <p className="course-description">{outline.description}</p>
        )}

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${outline.completionPercent}%` }} 
            />
          </div>
          <p className="progress-text">
            {outline.completedLessons} / {outline.totalLessons} lessons ({outline.completionPercent}%)
          </p>
        </div>

        {/* Current Status */}
        {outline.enrollmentStatus === 'active' && (
          <div className="current-status">
            {currentLessonTitle ? (
              <>
                <span className="status-label">Currently at:</span>
                <span className="current-lesson-title">{currentLessonTitle}</span>
              </>
            ) : (
              <span className="status-label">Course completed!</span>
            )}
          </div>
        )}

        {outline.enrollmentStatus === 'blocked' && (
          <div className="enrollment-blocked">
            Your enrollment is blocked. Please contact support.
          </div>
        )}

        {outline.enrollmentStatus === 'none' && (
          <div className="not-enrolled">
            You are not enrolled in this course.
          </div>
        )}

        {/* Continue Button */}
        {outline.enrollmentStatus === 'active' && outline.currentLessonId && (
          <button className="continue-button" onClick={handleContinue}>
            <Play size={18} />
            Continue Learning
          </button>
        )}

        {outline.enrollmentStatus === 'active' && !outline.currentLessonId && (
          <button className="review-button" onClick={() => {}}>
            <CheckCircle size={18} />
            Review Course
          </button>
        )}
      </div>

      {/* Modules List */}
      <div className="modules-list">
        {outline.modules.map((module) => (
          <div key={module.id} className="module-section">
            <div 
              className="module-header"
              onClick={() => toggleModule(module.id)}
            >
              <div className="module-info">
                <span className="expand-icon">
                  {expandedModules.has(module.id) ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </span>
                <h2 className="module-title">{module.title}</h2>
              </div>
              <div className="module-progress">
                <div className="module-progress-bar">
                  <div 
                    className="module-progress-fill" 
                    style={{ width: `${module.progressPercent}%` }} 
                  />
                </div>
                <span className="module-progress-text">{module.progressPercent}%</span>
              </div>
            </div>

            {expandedModules.has(module.id) && (
              <div className="lessons-list">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className={`lesson-row ${lesson.status} ${lesson.isCurrent ? 'current' : ''} ${!lesson.canOpen ? 'disabled' : ''}`}
                    onClick={() => handleLessonClick(lesson)}
                  >
                    <span className="lesson-status-icon">{getStatusIcon(lesson)}</span>
                    <span className="lesson-type-icon">{getTypeIcon(lesson.type)}</span>
                    <div className="lesson-info">
                      <span className="lesson-title">{lesson.title}</span>
                      {lesson.isCurrent && (
                        <span className="current-badge">Current</span>
                      )}
                      {lesson.isQuiz && lesson.status === 'completed' && (
                        <span className="quiz-score">
                          Score: {lesson.lastScorePercent}%
                          {lesson.canRetake && ' • Can retake'}
                        </span>
                      )}
                    </div>
                    <span className="lesson-arrow">{lesson.canOpen ? '›' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
