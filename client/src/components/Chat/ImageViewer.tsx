import React from 'react';
import './Chat.css';

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        <button className="image-viewer-close" onClick={onClose}>
          ✕
        </button>
        <img src={imageUrl} alt="Full size" className="image-viewer-image" />
        <div className="image-viewer-controls">
          <a href={imageUrl} download className="btn-download">
            ⬇ Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;

