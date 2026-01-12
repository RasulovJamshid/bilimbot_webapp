import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { webappApi } from '../lib/api';
import { useState } from 'react';
import { BookOpen, GraduationCap, Loader2, AlertCircle, User, BarChart3, Settings as SettingsIcon, HelpCircle, Award } from 'lucide-react';
import './Home.css';

export function Home() {
  const { loading, error, student, myCourses, availableCourses, refreshCourses } = useApp();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner-icon" size={48} />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} className="error-icon" />
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
          <div className="welcome-header">
            <User size={32} className="user-icon" />
            <h1>Hello, {student.firstName || 'Student'}!</h1>
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="quick-nav">
        <button className="nav-button" onClick={() => navigate('/progress')}>
          <BarChart3 size={20} />
          <span>Progress</span>
        </button>
        <button className="nav-button" onClick={() => navigate('/certificates')}>
          <Award size={20} />
          <span>Certificates</span>
        </button>
        <button className="nav-button" onClick={() => navigate('/settings')}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
        <button className="nav-button" onClick={() => navigate('/help')}>
          <HelpCircle size={20} />
          <span>Help</span>
        </button>
      </div>

      {/* My Courses */}
      <section className="courses-section">
        <div className="section-header">
          <BookOpen size={24} />
          <h2>My Courses</h2>
        </div>
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
          <div className="section-header">
            <GraduationCap size={24} />
            <h2>Available Courses</h2>
          </div>
          <div className="courses-list">
            {availableCourses.map((course) => (
              <div key={course.id} className="course-card available">
                <h3>{course.title}</h3>
                {course.description && (
                  <p className="course-description">{course.description}</p>
                )}
                <div className="lessons-count">
                  <BookOpen size={16} />
                  {course.totalLessons} lessons
                </div>
                {course.price && course.price > 0 ? (
                  <p className="price">{course.price.toLocaleString()} UZS</p>
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
