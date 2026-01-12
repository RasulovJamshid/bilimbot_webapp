import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTelegramWebApp } from '../lib/telegram';
import { User, Globe, Bell, Info, LogOut } from 'lucide-react';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [language, setLanguage] = useState('uz');

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate('/'));
    }

    // Load student data from session
    const studentData = sessionStorage.getItem('student');
    if (studentData) {
      const parsed = JSON.parse(studentData);
      setStudent(parsed);
      setLanguage(parsed.language || 'uz');
    }

    return () => {
      if (tg) {
        tg.BackButton.hide();
        tg.BackButton.offClick(() => navigate('/'));
      }
    };
  }, [navigate]);

  const handleLanguageChange = () => {
    const tg = getTelegramWebApp();
    tg?.showAlert('To change language, please use the bot settings via /settings command in chat.');
  };

  const handleNotificationSettings = () => {
    const tg = getTelegramWebApp();
    tg?.showAlert('Notification settings can be managed through the bot in chat.');
  };

  const handleAbout = () => {
    const tg = getTelegramWebApp();
    tg?.showAlert('Course Creator Bot v1.0\n\nA modern learning platform built with Telegram Mini Apps.');
  };

  const handleLogout = () => {
    const tg = getTelegramWebApp();
    tg?.showConfirm('Are you sure you want to close the app?', (confirmed) => {
      if (confirmed) {
        tg.close();
      }
    });
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {/* Profile Section */}
      <div className="settings-section">
        <div className="section-header">
          <User size={20} />
          <h2>Profile</h2>
        </div>
        <div className="settings-card">
          <div className="profile-info">
            <div className="profile-avatar">
              {student?.firstName?.[0] || 'U'}
            </div>
            <div className="profile-details">
              <div className="profile-name">
                {student?.firstName} {student?.lastName}
              </div>
              {student?.username && (
                <div className="profile-username">@{student.username}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="settings-section">
        <div className="section-header">
          <Globe size={20} />
          <h2>Language</h2>
        </div>
        <div className="settings-card">
          <button className="settings-item" onClick={handleLanguageChange}>
            <span>Uzbek (O'zbek)</span>
            {language === 'uz' && <span className="checkmark">✓</span>}
          </button>
          <button className="settings-item" onClick={handleLanguageChange}>
            <span>Russian (Русский)</span>
            {language === 'ru' && <span className="checkmark">✓</span>}
          </button>
          <button className="settings-item" onClick={handleLanguageChange}>
            <span>English</span>
            {language === 'en' && <span className="checkmark">✓</span>}
          </button>
        </div>
        <p className="settings-note">
          Language changes will be applied through the bot chat
        </p>
      </div>

      {/* Notifications Section */}
      <div className="settings-section">
        <div className="section-header">
          <Bell size={20} />
          <h2>Notifications</h2>
        </div>
        <div className="settings-card">
          <button className="settings-item" onClick={handleNotificationSettings}>
            <span>Manage Notifications</span>
            <span className="arrow">›</span>
          </button>
        </div>
        <p className="settings-note">
          Configure notification preferences in bot chat
        </p>
      </div>

      {/* About Section */}
      <div className="settings-section">
        <div className="section-header">
          <Info size={20} />
          <h2>About</h2>
        </div>
        <div className="settings-card">
          <button className="settings-item" onClick={handleAbout}>
            <span>About This App</span>
            <span className="arrow">›</span>
          </button>
          <button className="settings-item" onClick={() => navigate('/help')}>
            <span>Help & Support</span>
            <span className="arrow">›</span>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="settings-section">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Close App
        </button>
      </div>
    </div>
  );
}
