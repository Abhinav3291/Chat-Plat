import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface EditMessageModalProps {
  message: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({ message, onSave, onCancel }) => {
  const [editedMessage, setEditedMessage] = useState(message);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editedMessage.length, editedMessage.length);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedMessage.trim() && editedMessage.trim() !== message) {
      onSave(editedMessage.trim());
    } else if (editedMessage.trim() === message) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal edit-message-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Message</h3>
          <button className="btn-icon" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <textarea
              ref={textareaRef}
              className="edit-message-textarea"
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder="Edit your message..."
            />
            <p className="edit-hint">Press Enter to save, Shift+Enter for new line, Esc to cancel</p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!editedMessage.trim() || editedMessage.trim() === message}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMessageModal;

