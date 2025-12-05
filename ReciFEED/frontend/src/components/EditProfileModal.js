import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/layout/EditProfileModal.css';

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdated }) => {
  const { updateUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !email.trim()) {
      setError('Username and email are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = user?.id || user?.userId || user?._id;
      
      const response = await fetch(`http://localhost:5050/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setSuccess('Profile updated successfully!');
      
      // Update AuthContext with new user data (this will update Feed, Recipe, Sidebar, etc.)
      updateUser({ username, email });

      // Call the callback to refresh profile data
      if (onProfileUpdated) {
        onProfileUpdated(data.data);
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess('');
        // Refresh the page to load updated posts with new username
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      setSuccess('');
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'edit-profile-modal-overlay') {
      handleClose();
    }
  };

  return (
    <div className="edit-profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-profile-modal">
        <div className="edit-profile-modal__header">
          <h2>Edit Profile</h2>
          <button 
            className="edit-profile-modal__close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form className="edit-profile-modal__form" onSubmit={handleSubmit}>
          {error && (
            <div className="edit-profile-modal__error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="edit-profile-modal__success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {success}
            </div>
          )}

          <div className="edit-profile-modal__avatar-section">
            <div className="edit-profile-modal__avatar">
              {username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <p className="edit-profile-modal__avatar-label">Profile Picture</p>
          </div>

          <div className="edit-profile-modal__field">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isSubmitting}
              maxLength={50}
              required
            />
          </div>

          <div className="edit-profile-modal__field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="edit-profile-modal__actions">
            <button
              type="button"
              className="edit-profile-modal__cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-profile-modal__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="edit-profile-modal__spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 21v-8H7v8M7 3v5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
