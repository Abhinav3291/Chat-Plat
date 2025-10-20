import React from 'react';
import { API_URL } from '../../config';
import './Chat.css';

interface FilePreviewProps {
  type: string;
  fileUrl: string;
  fileName: string;
  content?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ type, fileUrl, fileName, content }) => {
  const fullUrl = `${API_URL}${fileUrl}`;

  const getFileIcon = () => {
    if (type === 'pdf') return '📄';
    if (type === 'document') {
      if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return '📝';
      if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return '📊';
      if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return '📽️';
      return '📄';
    }
    if (type === 'video') return '🎥';
    if (type === 'audio') return '🎵';
    if (fileName.endsWith('.zip') || fileName.endsWith('.rar') || fileName.endsWith('.7z')) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Video preview
  if (type === 'video') {
    return (
      <div className="file-preview video-preview">
        <video
          controls
          className="video-player"
          preload="metadata"
        >
          <source src={fullUrl} type="video/mp4" />
          Your browser does not support video playback.
        </video>
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          <a
            href={fullUrl}
            download={fileName}
            className="download-link"
            title="Download file"
          >
            ⬇️ Download
          </a>
        </div>
      </div>
    );
  }

  // Audio preview
  if (type === 'audio') {
    return (
      <div className="file-preview audio-preview">
        <div className="audio-icon">🎵</div>
        <audio controls className="audio-player">
          <source src={fullUrl} />
          Your browser does not support audio playback.
        </audio>
        <div className="file-info">
          <span className="file-name">{fileName}</span>
          <a
            href={fullUrl}
            download={fileName}
            className="download-link"
            title="Download file"
          >
            ⬇️ Download
          </a>
        </div>
      </div>
    );
  }

  // PDF preview
  if (type === 'pdf') {
    return (
      <div className="file-preview pdf-preview">
        <div className="pdf-container">
          <div className="pdf-icon">📄</div>
          <div className="pdf-details">
            <span className="file-name">{fileName}</span>
            <span className="file-type">PDF Document</span>
          </div>
        </div>
        <div className="file-actions">
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-link"
          >
            👁️ View
          </a>
          <a
            href={fullUrl}
            download={fileName}
            className="download-link"
          >
            ⬇️ Download
          </a>
        </div>
      </div>
    );
  }

  // Document/File preview
  return (
    <div className="file-preview document-preview">
      <div className="document-container">
        <div className="document-icon">{getFileIcon()}</div>
        <div className="document-details">
          <span className="file-name">{fileName}</span>
          <span className="file-type">{type.toUpperCase()}</span>
        </div>
      </div>
      <div className="file-actions">
        <a
          href={fullUrl}
          download={fileName}
          className="download-link"
        >
          ⬇️ Download
        </a>
      </div>
    </div>
  );
};

export default FilePreview;

