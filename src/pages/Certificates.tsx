import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { webappApi } from '../lib/api';
import { getTelegramWebApp } from '../lib/telegram';
import { Award, Calendar, Download, Share2, Loader2, AlertCircle, Trophy } from 'lucide-react';
import './Certificates.css';

interface Certificate {
  id: number;
  courseId: number;
  courseTitle: string;
  certificateCode: string;
  completedAt: string;
  studentName: string;
}

export function Certificates() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    loadCertificates();

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

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await webappApi.getCertificates();
      setCertificates(response.data);
    } catch (err) {
      console.error('Failed to load certificates:', err);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (cert: Certificate) => {
    const tg = getTelegramWebApp();
    const shareText = `🎓 I've completed "${cert.courseTitle}"!\n\nCertificate ID: ${cert.certificateCode}`;
    
    if (tg) {
      // Copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        tg.showAlert('Certificate info copied to clipboard!');
      });
    }
  };

  const handleDownload = (_cert: Certificate) => {
    const tg = getTelegramWebApp();
    tg?.showAlert('Certificate download will be available soon. Contact support to get your certificate.');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner-icon" size={48} />
        <p>Loading certificates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={48} className="error-icon" />
        <p className="error-text">{error}</p>
        <button className="retry-button" onClick={loadCertificates}>
          Try Again
        </button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="empty-container">
        <Trophy size={64} className="empty-icon" />
        <h2>No Certificates Yet</h2>
        <p>Complete a course to earn your first certificate!</p>
        <button className="browse-button" onClick={() => navigate('/')}>
          Browse Courses
        </button>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <h1 className="certificates-title">My Certificates</h1>

      <div className="certificates-stats">
        <div className="stat-badge">
          <Award size={24} />
          <div>
            <div className="stat-number">{certificates.length}</div>
            <div className="stat-label">Certificates Earned</div>
          </div>
        </div>
      </div>

      <div className="certificates-list">
        {certificates.map((cert) => (
          <div key={cert.id} className="certificate-card">
            <div className="certificate-header">
              <div className="certificate-icon">
                <Award size={32} />
              </div>
              <div className="certificate-info">
                <h3 className="certificate-course">{cert.courseTitle}</h3>
                <div className="certificate-meta">
                  <Calendar size={14} />
                  <span>{formatDate(cert.completedAt)}</span>
                </div>
              </div>
            </div>

            <div className="certificate-body">
              <div className="certificate-code-section">
                <span className="code-label">Certificate ID</span>
                <code className="certificate-code">{cert.certificateCode}</code>
              </div>

              <div className="certificate-student">
                <span className="student-label">Awarded to</span>
                <span className="student-name">{cert.studentName}</span>
              </div>
            </div>

            <div className="certificate-actions">
              <button 
                className="action-button secondary"
                onClick={() => handleShare(cert)}
              >
                <Share2 size={16} />
                Share
              </button>
              <button 
                className="action-button primary"
                onClick={() => handleDownload(cert)}
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="certificates-footer">
        <p className="footer-note">
          🎓 Certificates are proof of your achievement and can be verified using the Certificate ID.
        </p>
      </div>
    </div>
  );
}
