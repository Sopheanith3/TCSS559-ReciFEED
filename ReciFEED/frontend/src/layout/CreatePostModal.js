import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Compress and resize image before converting to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to resize image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (0.8 quality for JPEG)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          setImagePreview(compressedBase64);
          setImages([compressedBase64]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImages([]);
    setImagePreview(null);
    setImageUrl('');
    setError(''); // Clear any image-related errors
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    
    if (url.trim()) {
      // Validate URL format
      try {
        new URL(url);
        setImagePreview(url);
        setImages([url]);
        setError('');
      } catch {
        setError('Please enter a valid image URL');
        setImagePreview(null);
        setImages([]);
      }
    } else {
      setImagePreview(null);
      setImages([]);
    }
  };

  const handleMethodChange = (method) => {
    setUploadMethod(method);
    setImages([]);
    setImagePreview(null);
    setImageUrl('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write something in your post');
      return;
    }

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract userId as string
      let userId = user.id || user.userId;
      if (typeof userId === 'object') {
        userId = userId.id || userId.userId || userId._id;
      }
      userId = String(userId);
      const username = user.username || 'Anonymous';

      // Create post via API
      await postService.createPost({
        content: content.trim(),
        images: images,
        userId: userId,
        username: username
      });

      // Reset form
      setContent('');
      setImages([]);
      setImagePreview(null);
      setImageUrl('');
      setUploadMethod('upload');
      setError('');

      // Notify parent component to refresh feed
      if (onPostCreated) {
        onPostCreated();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setContent('');
      setImages([]);
      setImagePreview(null);
      setImageUrl('');
      setUploadMethod('upload');
      setError('');
      onClose();
    }
  };

  return (
    <div className="create-post-modal__overlay" onClick={handleClose}>
      <div className="create-post-modal__container" onClick={(e) => e.stopPropagation()}>
        <div className="create-post-modal__header">
          <h2 className="create-post-modal__title">Create Post</h2>
          <button 
            className="create-post-modal__close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            &times;
          </button>
        </div>
        <form className="create-post-modal__form" onSubmit={handleSubmit}>
          <label className="create-post-modal__label">What's on your mind?</label>
          <textarea
            className="create-post-modal__textarea"
            placeholder="Share your thoughts, recipes, or food experiences..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            disabled={isSubmitting}
            required
          />

          <label className="create-post-modal__label">Add Photo (Optional):</label>
          
          {/* Toggle between Upload and URL */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => handleMethodChange('upload')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: uploadMethod === 'upload' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: uploadMethod === 'upload' 
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: uploadMethod === 'upload' 
                  ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                  : 'none'
              }}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (uploadMethod !== 'upload' && !isSubmitting) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (uploadMethod !== 'upload') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              📤 Upload File
            </button>
            <button
              type="button"
              onClick={() => handleMethodChange('url')}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: uploadMethod === 'url' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                border: uploadMethod === 'url' 
                  ? 'none'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: uploadMethod === 'url' 
                  ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                  : 'none'
              }}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (uploadMethod !== 'url' && !isSubmitting) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (uploadMethod !== 'url') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
            >
              🔗 Image URL
            </button>
          </div>

          {uploadMethod === 'url' ? (
            // URL Input Method
            <div>
              <input
                type="text"
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                value={imageUrl}
                onChange={handleImageUrlChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  marginBottom: '16px',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {imagePreview && (
                <div className="create-post-modal__image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      borderRadius: '12px',
                      maxHeight: '350px',
                      objectFit: 'contain',
                      background: 'rgba(0, 0, 0, 0.3)'
                    }} 
                    onError={() => {
                      setError('Failed to load image from URL');
                      setImagePreview(null);
                      setImages([]);
                    }}
                  />
                  <button
                    type="button"
                    className="create-post-modal__remove-image"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          ) : (
            // File Upload Method
            <div className="create-post-modal__upload-box">
            {imagePreview ? (
              <div className="create-post-modal__image-preview">
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                <button
                  type="button"
                  className="create-post-modal__remove-image"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                >
                  &times;
                </button>
              </div>
            ) : (
              <>
                <input 
                  type="file" 
                  id="upload-photo" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  style={{ display: 'none' }} 
                />
                <label htmlFor="upload-photo" className="create-post-modal__upload-label">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V4M12 4l-5 5M12 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="3" y="16" width="18" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Upload Photo
                </label>
              </>
            )}
          </div>
          )}

          {error && (
            <div className="create-post-modal__error" style={{ 
              color: '#ff6b6b', 
              fontSize: '0.9rem', 
              marginTop: '10px',
              padding: '8px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="create-post-modal__post-btn"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
