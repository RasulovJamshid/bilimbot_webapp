import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTelegramWebApp } from '../lib/telegram';
import { HelpCircle, BookOpen, Video, FileText, MessageCircle, Mail } from 'lucide-react';
import './Help.css';

export function Help() {
  const navigate = useNavigate();

  useEffect(() => {
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

  const handleContactSupport = () => {
    const tg = getTelegramWebApp();
    tg?.showAlert('For support, please contact us through the bot chat or send a message to our support team.');
  };

  return (
    <div className="help-page">
      <h1 className="help-title">Help & Support</h1>

      {/* Getting Started */}
      <div className="help-section">
        <div className="section-header">
          <BookOpen size={20} />
          <h2>Getting Started</h2>
        </div>
        <div className="help-card">
          <div className="help-item">
            <h3>How to enroll in a course?</h3>
            <p>Browse available courses on the home page and tap "Enroll" button. Once enrolled, you can start learning immediately.</p>
          </div>
          <div className="help-item">
            <h3>How to navigate lessons?</h3>
            <p>Open a course, view its syllabus, and tap on any unlocked lesson to start. Complete lessons in order to unlock the next ones.</p>
          </div>
          <div className="help-item">
            <h3>How to track progress?</h3>
            <p>Visit the Progress page to see your overall statistics, course completion rates, and detailed progress for each course.</p>
          </div>
        </div>
      </div>

      {/* Lesson Types */}
      <div className="help-section">
        <div className="section-header">
          <FileText size={20} />
          <h2>Lesson Types</h2>
        </div>
        <div className="help-card">
          <div className="help-item">
            <div className="lesson-type">
              <FileText size={18} className="type-icon text" />
              <div>
                <h3>Text Lessons</h3>
                <p>Read educational content directly in the app. May include resources and downloadable files.</p>
              </div>
            </div>
          </div>
          <div className="help-item">
            <div className="lesson-type">
              <Video size={18} className="type-icon video" />
              <div>
                <h3>Video Lessons</h3>
                <p>Watch video content in Telegram chat. Tap "Watch in Chat" to receive the video message.</p>
              </div>
            </div>
          </div>
          <div className="help-item">
            <div className="lesson-type">
              <HelpCircle size={18} className="type-icon quiz" />
              <div>
                <h3>Quiz Lessons</h3>
                <p>Test your knowledge with interactive quizzes. Answer all questions and submit to see your score.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="help-section">
        <div className="section-header">
          <HelpCircle size={20} />
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="help-card">
          <div className="help-item">
            <h3>Can I retake quizzes?</h3>
            <p>Yes, if the course allows quiz retakes. Check the course settings or contact your instructor.</p>
          </div>
          <div className="help-item">
            <h3>How do I download course materials?</h3>
            <p>File lessons include downloadable resources. Tap on file links to download them to your device.</p>
          </div>
          <div className="help-item">
            <h3>What happens if I fail a quiz?</h3>
            <p>You can review the correct answers and retake the quiz if allowed. Your progress is saved automatically.</p>
          </div>
          <div className="help-item">
            <h3>Can I access courses offline?</h3>
            <p>Currently, an internet connection is required to access course content and track progress.</p>
          </div>
          <div className="help-item">
            <h3>How do I get a certificate?</h3>
            <p>Complete all lessons in a course to receive a certificate. It will be sent to you via the bot chat.</p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="help-section">
        <div className="section-header">
          <MessageCircle size={20} />
          <h2>Need More Help?</h2>
        </div>
        <div className="help-card">
          <p className="support-text">
            If you have questions or need assistance, our support team is here to help!
          </p>
          <button className="contact-button" onClick={handleContactSupport}>
            <Mail size={18} />
            Contact Support
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="help-section">
        <div className="tips-card">
          <h3>💡 Pro Tips</h3>
          <ul className="tips-list">
            <li>Complete lessons regularly to maintain your learning streak</li>
            <li>Use the Progress page to track your achievements</li>
            <li>Take notes while watching video lessons</li>
            <li>Review quiz results to understand your mistakes</li>
            <li>Explore all available courses to find what interests you</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
