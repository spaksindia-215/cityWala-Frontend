import { useEffect, useRef } from 'react';
import '../styles/SessionTimeoutModal.css';

export function SessionTimeoutModal({
  isVisible,
  timeRemaining,
  formattedTime,
  onStayLoggedIn,
  onLogout,
}) {
  const modalRef = useRef(null);
  const stayButtonRef = useRef(null);

  useEffect(() => {
    if (isVisible && stayButtonRef.current) {
      // Focus the "Stay Logged In" button when modal appears
      stayButtonRef.current.focus();

      // Add event listener for Enter key
      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onStayLoggedIn?.();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onLogout?.();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, onStayLoggedIn, onLogout]);

  if (!isVisible) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const warningColor = minutes === 0 && seconds < 60 ? '#d32f2f' : '#f57c00';

  return (
    <div className="session-timeout-overlay" aria-modal="true" role="dialog">
      <div className="session-timeout-modal" ref={modalRef}>
        {/* Close button (accessibility) */}
        <button
          className="modal-close-btn"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>

        {/* Modal content */}
        <div className="modal-content">
          <h2 className="modal-title">Session Expiring</h2>

          <div className="modal-message">
            <p>Your session will expire due to inactivity.</p>
          </div>

          <div className="timer-display" style={{ color: warningColor }}>
            <span className="timer-label">Time remaining:</span>
            <span className="timer-value">{formattedTime}</span>
          </div>

          <p className="modal-description">
            Click "Stay Logged In" to continue your session.
          </p>

          {/* Action buttons */}
          <div className="modal-actions">
            <button
              className="btn btn-primary stay-logged-in-btn"
              onClick={onStayLoggedIn}
              ref={stayButtonRef}
              autoFocus
            >
              Stay Logged In
            </button>
            <button
              className="btn btn-secondary logout-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>

          {/* Accessibility info */}
          <p className="modal-a11y-help">
            <small>
              Press Enter to stay logged in, or Escape to logout.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeoutModal;
