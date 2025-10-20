import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

interface MessageActionsProps {
  messageId: string;
  isOwnMessage: boolean;
  onEdit: () => void;
  onDeleteForEveryone: () => void;
  onDeleteForMe: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  isOwnMessage,
  onEdit,
  onDeleteForEveryone,
  onDeleteForMe,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="message-actions" ref={menuRef}>
      <button
        className="message-actions-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="Message actions"
      >
        ⋮
      </button>

      {showMenu && (
        <div className="message-actions-menu">
          {isOwnMessage && (
            <>
              <button
                className="menu-item"
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
              >
                <span>✏️</span> Edit Message
              </button>
              <button
                className="menu-item danger"
                onClick={() => {
                  if (window.confirm('Delete this message for everyone?')) {
                    onDeleteForEveryone();
                    setShowMenu(false);
                  }
                }}
              >
                <span>🗑️</span> Delete for Everyone
              </button>
            </>
          )}
          <button
            className="menu-item"
            onClick={() => {
              onDeleteForMe();
              setShowMenu(false);
            }}
          >
            <span>👁️</span> Delete for Me
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageActions;

