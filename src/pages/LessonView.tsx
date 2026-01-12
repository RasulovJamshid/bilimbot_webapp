import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { webappApi } from '../lib/api';
import type { LessonDetail, QuizResult, LessonOutlineItem } from '../lib/api';
import { getTelegramWebApp } from '../lib/telegram';
import { Loader2, CheckCircle, XCircle, BarChart3, Paperclip, FileText, Link as LinkIcon, Play, Video } from 'lucide-react';
import './LessonView.css';

export function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [lessonMeta, setLessonMeta] = useState<LessonOutlineItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [retaking, setRetaking] = useState(false);
  const [showQuizSummary, setShowQuizSummary] = useState(false);

  useEffect(() => {
    loadLesson();

    // Setup back button
    const tg = getTelegramWebApp();
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate(`/courses/${courseId}`));
    }

    return () => {
      if (tg) {
        tg.BackButton.hide();
        tg.BackButton.offClick(() => navigate(`/courses/${courseId}`));
      }
    };
  }, [courseId, lessonId, navigate]);

  const loadLesson = async () => {
    if (!courseId || !lessonId) return;

    try {
      setLoading(true);
      
      // Load lesson detail
      const response = await webappApi.getLessonDetail(
        parseInt(courseId),
        parseInt(lessonId),
      );
      setLesson(response.data);

      // Load outline to get quiz metadata
      try {
        const outlineResponse = await webappApi.getCourseOutline(parseInt(courseId));
        for (const module of outlineResponse.data.modules) {
          const found = module.lessons.find(l => l.id === parseInt(lessonId));
          if (found) {
            setLessonMeta(found);
            break;
          }
        }
      } catch (e) {
        console.warn('Could not load lesson metadata:', e);
      }

      // Initialize quiz answers array or show summary for completed quiz
      if (response.data.questions) {
        if (response.data.status === 'completed') {
          setShowQuizSummary(true);
        } else {
          setQuizAnswers(new Array(response.data.questions.length).fill(-1));
          setShowQuizSummary(false);
        }
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
      setError('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!lessonId) return;

    try {
      setCompleting(true);
      await webappApi.completeLesson(parseInt(lessonId));
      
      const tg = getTelegramWebApp();
      tg?.showAlert('✅ Lesson completed!');
      
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleWatchVideo = async () => {
    if (!lessonId) return;
    
    const tg = getTelegramWebApp();
    
    try {
      // Show loading state
      tg?.showPopup({
        title: 'Loading',
        message: 'Sending video to chat...',
        buttons: []
      });
      
      // Call API to request video be sent to chat
      await webappApi.requestVideo(parseInt(lessonId));
      
      // Close WebApp to return to chat where video will appear
      if (tg) {
        tg.close();
      }
    } catch (err: any) {
      console.error('Failed to request video:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to send video. Please try again.';
      tg?.showAlert(`Error: ${errorMsg}`);
    }
  };

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (!lessonId || !lesson?.questions) return;

    // Check if all questions are answered
    if (quizAnswers.some((a) => a === -1)) {
      const tg = getTelegramWebApp();
      tg?.showAlert('Please answer all questions before submitting.');
      return;
    }

    try {
      setSubmittingQuiz(true);
      const response = await webappApi.submitQuiz(parseInt(lessonId), quizAnswers);
      setQuizResult(response.data);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleNextAfterQuiz = () => {
    navigate(`/courses/${courseId}/syllabus`);
  };

  const handleRetakeQuiz = async () => {
    if (!lessonId) return;

    try {
      setRetaking(true);
      await webappApi.retakeQuiz(parseInt(lessonId));
      
      // Reset quiz state
      setQuizResult(null);
      setShowQuizSummary(false);
      setCurrentQuestion(0);
      if (lesson?.questions) {
        setQuizAnswers(new Array(lesson.questions.length).fill(-1));
      }
      
      // Reload lesson to get fresh state
      await loadLesson();
    } catch (err) {
      console.error('Failed to retake quiz:', err);
      const tg = getTelegramWebApp();
      tg?.showAlert('Failed to start quiz retake. Please try again.');
    } finally {
      setRetaking(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner-icon" size={48} />
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="error-container">
        <p className="error-text">{error || 'Lesson not found'}</p>
      </div>
    );
  }

  // Render quiz result
  if (quizResult) {
    return (
      <div className="lesson-view-page">
        <div className="quiz-result">
          <div className="quiz-result-header">
            <BarChart3 size={32} />
            <h1>Quiz Results</h1>
          </div>
          <div className="score-display">
            <span className="score">{quizResult.score}</span>
            <span className="separator">/</span>
            <span className="total">{quizResult.totalScore}</span>
          </div>
          <p className="percentage">{quizResult.percentage}%</p>
          
          <div className="results-list">
            {quizResult.results.map((result, index) => (
              <div
                key={index}
                className={`result-item ${result.correct ? 'correct' : 'incorrect'}`}
              >
                <span className="question-num">Q{index + 1}</span>
                {result.correct ? (
                  <CheckCircle size={20} className="result-icon correct" />
                ) : (
                  <XCircle size={20} className="result-icon incorrect" />
                )}
                <span className="points">+{result.points} pts</span>
              </div>
            ))}
          </div>

          <button className="next-button" onClick={handleNextAfterQuiz}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-view-page">
      <h1 className="lesson-title">{lesson.title}</h1>
      
      {lesson.status === 'completed' && (
        <div className="completed-badge">
          <CheckCircle size={18} />
          <span>Completed</span>
        </div>
      )}

      {/* Text Lesson */}
      {lesson.type === 'text' && (
        <div className="text-content">
          {lesson.text && <p>{lesson.text}</p>}
          
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="resources-section">
              <div className="resources-header">
                <Paperclip size={20} />
                <h3>Resources</h3>
              </div>
              {lesson.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  {resource.type === 'file' ? (
                    <FileText size={16} />
                  ) : (
                    <LinkIcon size={16} />
                  )}
                  {resource.label}
                </a>
              ))}
            </div>
          )}

          {lesson.status !== 'completed' && (
            <button
              className="complete-button"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <>
                  <Loader2 size={18} className="button-spinner" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Mark as Completed
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* File Lesson */}
      {lesson.type === 'file' && (
        <div className="file-content">
          {lesson.description && <p>{lesson.description}</p>}
          
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="resources-section">
              <div className="resources-header">
                <Paperclip size={20} />
                <h3>Files & Resources</h3>
              </div>
              {lesson.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  {resource.type === 'file' ? (
                    <FileText size={16} />
                  ) : (
                    <LinkIcon size={16} />
                  )}
                  {resource.label}
                </a>
              ))}
            </div>
          )}

          {lesson.status !== 'completed' && (
            <button
              className="complete-button"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <>
                  <Loader2 size={18} className="button-spinner" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Mark as Completed
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Video Lesson */}
      {lesson.type === 'video' && (
        <div className="video-content">
          {lesson.description && <p className="video-description">{lesson.description}</p>}
          
          {lesson.videoUrl ? (
            <div className="video-player-wrapper">
              <video 
                controls 
                className="video-player" 
                src={lesson.videoUrl} 
                style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
              />
              
              {lesson.status !== 'completed' && (
                <button
                  className="complete-button"
                  onClick={handleComplete}
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <Loader2 size={18} className="button-spinner" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Mark as Completed
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="video-placeholder">
                <Video size={48} className="video-icon" />
                <p>Videos are played in Telegram chat</p>
              </div>

              <button className="watch-button" onClick={handleWatchVideo}>
                <Play size={18} />
                Watch in Chat
              </button>
            </>
          )}

          {lesson.status === 'completed' && !lesson.videoUrl && (
            <p className="video-note">
              This lesson has been marked as completed.
            </p>
          )}
        </div>
      )}

      {/* Quiz Lesson */}
      {lesson.type === 'quiz' && lesson.questions && (
        <div className="quiz-content">
          {lesson.description && <p className="quiz-description">{lesson.description}</p>}

          {/* Show summary for completed quiz */}
          {showQuizSummary && lessonMeta && (
            <div className="quiz-summary">
              <h2>📊 Quiz Completed</h2>
              
              {lessonMeta.lastScorePercent !== null && lessonMeta.lastScorePercent !== undefined && (
                <div className="summary-score">
                  <span className="score-value">{lessonMeta.lastScorePercent}%</span>
                  <span className="score-label">Last Score</span>
                </div>
              )}

              {lessonMeta.attemptsUsed !== undefined && (
                <p className="attempts-info">
                  Attempts used: {lessonMeta.attemptsUsed}
                  {lessonMeta.maxAttempts && ` / ${lessonMeta.maxAttempts}`}
                </p>
              )}

              {lessonMeta.canRetake ? (
                <button 
                  className="retake-button"
                  onClick={handleRetakeQuiz}
                  disabled={retaking}
                >
                  {retaking ? 'Starting...' : '🔄 Retake Quiz'}
                </button>
              ) : (
                <p className="no-retake-message">
                  {lessonMeta.maxAttempts && lessonMeta.attemptsUsed && lessonMeta.attemptsUsed >= lessonMeta.maxAttempts
                    ? '❌ Maximum attempts reached'
                    : '❌ Quiz retake is not allowed'}
                </p>
              )}

              <button className="back-button" onClick={handleNextAfterQuiz}>
                ← Back to Syllabus
              </button>
            </div>
          )}

          {/* Show quiz questions if not completed or retaking */}
          {!showQuizSummary && (
            <>
              <div className="quiz-progress">
                Question {currentQuestion + 1} of {lesson.questions.length}
              </div>

              <div className="question-card">
                <p className="question-text">
                  {lesson.questions[currentQuestion].question}
                </p>
                <div className="options-list">
                  {lesson.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`option-button ${
                        quizAnswers[currentQuestion] === index ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectAnswer(currentQuestion, index)}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
              </div>

          <div className="quiz-navigation">
                {currentQuestion > 0 && (
                  <button
                    className="nav-button prev"
                    onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  >
                    ← Previous
                  </button>
                )}
                
                {currentQuestion < lesson.questions.length - 1 ? (
                  <button
                    className="nav-button next"
                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                    disabled={quizAnswers[currentQuestion] === -1}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="submit-button"
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz || quizAnswers.some((a) => a === -1)}
                  >
                    {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                )}
              </div>

              <div className="question-dots">
                {lesson.questions.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${currentQuestion === index ? 'active' : ''} ${
                      quizAnswers[index] !== -1 ? 'answered' : ''
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
