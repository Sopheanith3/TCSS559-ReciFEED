import React from 'react';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="create-post-modal__overlay">
      <div className="create-post-modal__container">
        <div className="create-post-modal__header">
          <h2 className="create-post-modal__title">Create Post</h2>
          <button className="create-post-modal__close" onClick={onClose}>&times;</button>
        </div>
        <form className="create-post-modal__form">
          <label className="create-post-modal__label">Caption:</label>
          <input className="create-post-modal__input" type="text" placeholder="Enter caption..." />

          <label className="create-post-modal__label">Cushing Type:</label>
          <input className="create-post-modal__input" type="text" placeholder="Enter type..." />

          <label className="create-post-modal__label">Upload Photo:</label>
          <div className="create-post-modal__upload-box">
            <input type="file" id="upload-photo" style={{ display: 'none' }} />
            <label htmlFor="upload-photo" className="create-post-modal__upload-label">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V4M12 4l-5 5M12 4l5 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="16" width="18" height="4" rx="2" fill="none" stroke="black" strokeWidth="2"/>
              </svg>
              Upload Photo
            </label>
          </div>

          <button type="submit" className="create-post-modal__post-btn">Post</button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
