import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { webappApi } from '../lib/api';
import { useState } from 'react';
import './Home.css';

export function Home() {
  const { loading, error, student, myCourses, availableCourses, refreshCourses } = useApp();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  const handleEnroll = async (courseId: number) => {
    try {
      setEnrolling(courseId);
      await webappApi.enroll(courseId);
      await refreshCourses();
    } catch (err) {
      console.error('Failed to enroll:', err);
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="home-page">
      {student && (
        <div className="welcome-section">
          <h1>👋 Hello, {student.firstName || 'Student'}!</h1>
        </div>
      )}

      {/* My Courses */}
      <section className="courses-section">
        <h2>📚 My Courses</h2>
        {myCourses.length === 0 ? (
          <p className="empty-text">You haven't enrolled in any courses yet.</p>
        ) : (
          <div className="courses-list">
            {myCourses.map((course) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() => navigate(`/courses/${course.id}/syllabus`)}
              >
                <h3>{course.title}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(course.completedLessons / course.totalLessons) * 100}%`,
                    }}
                  />
                </div>
                <div className="progress-text">
                  <span>{course.completedLessons} / {course.totalLessons} lessons</span>
                  <span>{Math.round((course.completedLessons / course.totalLessons) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <section className="courses-section">
          <h2>🎓 Available Courses</h2>
          <div className="courses-list">
            {availableCourses.map((course) => (
              <div key={course.id} className="course-card available">
                <h3>{course.title}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="lessons-count">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  {course.totalLessons} lessons
                </div>
                {course.price && course.price > 0 ? (
                  <p className="price">💰 {course.price.toLocaleString()} UZS</p>
                ) : (
                  <button
                    className="enroll-button"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                  >
                    {enrolling === course.id ? 'Enrolling...' : 'Enroll Free'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
