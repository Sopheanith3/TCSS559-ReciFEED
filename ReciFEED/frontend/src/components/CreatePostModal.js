import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { recipeService } from '../services/recipeService';
import { twitterService } from '../services/twitterService';
import { bskyService } from '../services/bskyService';
import '../styles/layout/CreatePostModal.css';
import { analyticsService } from '../services/analyticsService';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Twitter cross-posting state
  const [isTwitterAuthorized, setIsTwitterAuthorized] = useState(false);
  const [crossPostToTwitter, setCrossPostToTwitter] = useState(false);
  const [showTwitterPinModal, setShowTwitterPinModal] = useState(false);
  const [twitterPin, setTwitterPin] = useState('');
  const [isAuthenticatingTwitter, setIsAuthenticatingTwitter] = useState(false);

  // Bluesky cross-posting state
  const [isBskyAuthorized, setIsBskyAuthorized] = useState(false);
  const [crossPostToBsky, setCrossPostToBsky] = useState(false);
  const [showBskyAuthModal, setShowBskyAuthModal] = useState(false);
  const [bskyIdentifier, setBskyIdentifier] = useState('');
  const [bskyPassword, setBskyPassword] = useState('');
  const [isAuthenticatingBsky, setIsAuthenticatingBsky] = useState(false);

  // Fetch recipes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecipes();
      checkTwitterAuth();
      checkBskyAuth();
    }
  }, [isOpen]);

  const checkTwitterAuth = async () => {
    try {
      const result = await twitterService.checkAuth();
      setIsTwitterAuthorized(result.authorized);
    } catch (err) {
      console.error('Error checking Twitter auth:', err);
      setIsTwitterAuthorized(false);
    }
  };

  const checkBskyAuth = async () => {
    try {
      const result = await bskyService.checkAuth();
      setIsBskyAuthorized(result.authorized);
    } catch (err) {
      console.error('Error checking Bluesky auth:', err);
      setIsBskyAuthorized(false);
    }
  };

  const handleVerifyTwitter = async () => {
    try {
      setIsAuthenticatingTwitter(true);
      const result = await twitterService.startAuth();
      setShowTwitterPinModal(true);
      
      // Open Twitter auth in new window
      window.open(result.redirectLink, '_blank', 'width=600,height=700');
    } catch (err) {
      console.error('Error starting Twitter auth:', err);
      setError(err.message || 'Failed to start Twitter authentication');
    } finally {
      setIsAuthenticatingTwitter(false);
    }
  };

  const handleTwitterPinSubmit = async () => {
    if (!twitterPin.trim()) {
      setError('Please enter the PIN from Twitter');
      return;
    }

    try {
      setIsAuthenticatingTwitter(true);
      await twitterService.completeAuth(twitterPin);
      setIsTwitterAuthorized(true);
      setShowTwitterPinModal(false);
      setTwitterPin('');
      setError('');
    } catch (err) {
      console.error('Error completing Twitter auth:', err);
      setError(err.message || 'Failed to verify PIN. Please try again.');
    } finally {
      setIsAuthenticatingTwitter(false);
    }
  };

  const handleVerifyBsky = () => {
    setShowBskyAuthModal(true);
  };

  const handleBskyAuthSubmit = async () => {
    if (!bskyIdentifier.trim() || !bskyPassword.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsAuthenticatingBsky(true);
      await bskyService.authenticate(bskyIdentifier, bskyPassword);
      setIsBskyAuthorized(true);
      setShowBskyAuthModal(false);
      setBskyIdentifier('');
      setBskyPassword('');
      setError('');
    } catch (err) {
      console.error('Error authenticating with Bluesky:', err);
      setError(err.message || 'Failed to authenticate with Bluesky. Please try again.');
    } finally {
      setIsAuthenticatingBsky(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setLoadingRecipes(true);
      const response = await recipeService.getAllRecipes(1, 100);
      if (response.status === 'success') {
        setRecipes(response.data.recipes || []);
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
    } finally {
      setLoadingRecipes(false);
    }
  };

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

      // Store the actual File object (multer will handle it on backend)
      setImages([file]);
      
      // Create preview for UI using FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
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
        username: username,
        recipe_id: selectedRecipeId || '000000000000000000000000'
      });

      // Cross-post to Twitter if checkbox is checked
      if (crossPostToTwitter && isTwitterAuthorized) {
        try {
          await twitterService.createPost(content.trim(), images);
        } catch (twitterErr) {
          console.error('Error posting to Twitter:', twitterErr);
          // Don't fail the whole post if Twitter fails
          setError('Post created, but failed to cross-post to Twitter: ' + (twitterErr.message || 'Unknown error'));
        }
      }

      // Cross-post to Bluesky if checkbox is checked
      if (crossPostToBsky && isBskyAuthorized) {
        try {
          await bskyService.createPost(content.trim(), images);
        } catch (bskyErr) {
          console.error('Error posting to Bluesky:', bskyErr);
          // Don't fail the whole post if Bluesky fails
          const currentError = error || '';
          setError(currentError ? currentError + ' Also failed to cross-post to Bluesky.' : 'Post created, but failed to cross-post to Bluesky: ' + (bskyErr.message || 'Unknown error'));
        }
      }

      // Log analytics event (don't let this fail the post creation)
      try {
        await analyticsService.log('create_post');
      } catch (analyticsErr) {
        console.warn('Analytics logging failed:', analyticsErr);
      }

      // Reset form
      setContent('');
      setImages([]);
      setImagePreview(null);
      setImageUrl('');
      setUploadMethod('upload');
      setSelectedRecipeId('');
      setCrossPostToTwitter(false);
      setCrossPostToBsky(false);
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
      setSelectedRecipeId('');
      setCrossPostToTwitter(false);
      setCrossPostToBsky(false);
      setShowTwitterPinModal(false);
      setShowBskyAuthModal(false);
      setTwitterPin('');
      setBskyIdentifier('');
      setBskyPassword('');
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

          <label className="create-post-modal__label">Link to Recipe (Optional):</label>
          <select
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
            disabled={isSubmitting || loadingRecipes}
            style={{
              width: '100%',
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              marginBottom: '20px',
              cursor: 'pointer',
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
          >
            <option value="" style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
              {loadingRecipes ? 'Loading recipes...' : 'None - No recipe linked'}
            </option>
            {recipes.map((recipe) => (
              <option 
                key={recipe._id} 
                value={recipe._id}
                style={{ backgroundColor: '#1a1a2e', color: '#fff' }}
              >
                {recipe.title} {recipe.username ? `(by ${recipe.username})` : ''}
              </option>
            ))}
          </select>

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

          {/* Twitter Cross-Posting Section */}
          <div style={{
            marginTop: '20px',
            marginBottom: '12px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {isTwitterAuthorized ? (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={crossPostToTwitter}
                  onChange={(e) => setCrossPostToTwitter(e.target.checked)}
                  disabled={isSubmitting}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#1DA1F2'
                  }}
                />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                </svg>
                Cross-post to Twitter
              </label>
            ) : (
              <button
                type="button"
                onClick={handleVerifyTwitter}
                disabled={isAuthenticatingTwitter}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isAuthenticatingTwitter ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: isAuthenticatingTwitter ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAuthenticatingTwitter) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 161, 242, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                </svg>
                {isAuthenticatingTwitter ? 'Connecting...' : 'Verify with Twitter'}
              </button>
            )}
          </div>

          {/* Bluesky Cross-Posting Section */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {isBskyAuthorized ? (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={crossPostToBsky}
                  onChange={(e) => setCrossPostToBsky(e.target.checked)}
                  disabled={isSubmitting}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#0085ff'
                  }}
                />
                <svg width="20" height="20" viewBox="0 0 600 530" fill="#0085ff">
                  <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/>
                </svg>
                Cross-post to Bluesky
              </label>
            ) : (
              <button
                type="button"
                onClick={handleVerifyBsky}
                disabled={isAuthenticatingBsky}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #0085ff 0%, #0066cc 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: isAuthenticatingBsky ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: isAuthenticatingBsky ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAuthenticatingBsky) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 133, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 600 530" fill="currentColor">
                  <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/>
                </svg>
                {isAuthenticatingBsky ? 'Connecting...' : 'Verify with Bluesky'}
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="create-post-modal__post-btn"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>

      {/* Twitter PIN Modal */}
      {showTwitterPinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowTwitterPinModal(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#fff',
                margin: 0
              }}>
                Enter Twitter PIN
              </h3>
            </div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.95rem',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              A Twitter authorization window should have opened. After authorizing the app, enter the PIN code shown:
            </p>

            <input
              type="text"
              value={twitterPin}
              onChange={(e) => setTwitterPin(e.target.value)}
              placeholder="Enter PIN code"
              disabled={isAuthenticatingTwitter}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                textAlign: 'center',
                marginBottom: '20px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1DA1F2';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTwitterPinSubmit();
                }
              }}
            />

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowTwitterPinModal(false)}
                disabled={isAuthenticatingTwitter}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isAuthenticatingTwitter ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isAuthenticatingTwitter ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAuthenticatingTwitter) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTwitterPinSubmit}
                disabled={isAuthenticatingTwitter || !twitterPin.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isAuthenticatingTwitter || !twitterPin.trim()
                    ? 'rgba(29, 161, 242, 0.3)'
                    : 'linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isAuthenticatingTwitter || !twitterPin.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isAuthenticatingTwitter && twitterPin.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 161, 242, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isAuthenticatingTwitter ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bluesky Auth Modal */}
      {showBskyAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowBskyAuthModal(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <svg width="28" height="28" viewBox="0 0 600 530" fill="#0085ff">
                <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/>
              </svg>
              <h3 style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#fff',
                margin: 0
              }}>
                Connect to Bluesky
              </h3>
            </div>
            
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.95rem',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Enter your Bluesky username and password to enable cross-posting:
            </p>

            <input
              type="text"
              value={bskyIdentifier}
              onChange={(e) => setBskyIdentifier(e.target.value)}
              placeholder="Username or email"
              disabled={isAuthenticatingBsky}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.95rem',
                marginBottom: '12px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0085ff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            />

            <input
              type="password"
              value={bskyPassword}
              onChange={(e) => setBskyPassword(e.target.value)}
              placeholder="Password"
              disabled={isAuthenticatingBsky}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.95rem',
                marginBottom: '20px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0085ff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleBskyAuthSubmit();
                }
              }}
            />

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowBskyAuthModal(false)}
                disabled={isAuthenticatingBsky}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isAuthenticatingBsky ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isAuthenticatingBsky ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAuthenticatingBsky) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBskyAuthSubmit}
                disabled={isAuthenticatingBsky || !bskyIdentifier.trim() || !bskyPassword.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: isAuthenticatingBsky || !bskyIdentifier.trim() || !bskyPassword.trim()
                    ? 'rgba(0, 133, 255, 0.3)'
                    : 'linear-gradient(135deg, #0085ff 0%, #0066cc 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isAuthenticatingBsky || !bskyIdentifier.trim() || !bskyPassword.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isAuthenticatingBsky && bskyIdentifier.trim() && bskyPassword.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 133, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isAuthenticatingBsky ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePostModal;
