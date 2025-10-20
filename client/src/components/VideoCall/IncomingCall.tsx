import React from 'react';
import { API_URL } from '../../config';
import './VideoCall.css';

interface IncomingCallProps {
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({
  callerName,
  callerAvatar,
  onAccept,
  onReject
}) => {
  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-modal">
        <div className="incoming-call-header">
          <h3>Incoming Video Call</h3>
        </div>

        <div className="incoming-call-content">
          <div className="caller-avatar">
            {callerAvatar ? (
              <img src={`${API_URL}${callerAvatar}`} alt={callerName} />
            ) : (
              <div className="avatar-placeholder-large">
                {callerName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="caller-name">{callerName}</h2>
          <p className="call-type">📹 Video Call</p>
        </div>

        <div className="incoming-call-actions">
          <button className="reject-btn" onClick={onReject}>
            <span>✕</span>
            <p>Decline</p>
          </button>

          <button className="accept-btn" onClick={onAccept}>
            <span>✓</span>
            <p>Accept</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;

