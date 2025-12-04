import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../layout/EditProfileModal';
import '../components/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        let userId = user?.id || user?.userId;
        if (typeof userId === 'object') {
          userId = userId._id || userId.id;
        }
        
        console.log('Fetching user details for userId:', userId);
        console.log('Full user object:', user);
        console.log('Token:', localStorage.getItem('token'));
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        const response = await fetch(`http://localhost:5050/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('User details received:', data);
        setUserDetails(data.data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Check if token exists in localStorage to determine if user should be logged in
    const token = localStorage.getItem('token');
    
    if (user) {
      fetchUserDetails();
    } else if (!token) {
      // Only show error if there's no token (truly not logged in)
      setError('No user logged in');
      setLoading(false);
    }
    // If token exists but user is null, keep loading (AuthContext is still initializing)
  }, [user]);

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/');
    }, 0);
  };

  const handleProfileUpdated = (updatedData) => {
    setUserDetails(updatedData);
    // Also update the user in context if needed
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>Error: {error}</p>
          <button onClick={() => navigate('/feed')} className="profile-back-btn">
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <button onClick={() => navigate('/feed')} className="profile-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Feed
        </button>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          {/* Profile Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {userDetails?.username?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="profile-username">
              {userDetails?.username || user?.username || 'User'}
            </h2>
            <p className="profile-handle">
              @{(userDetails?.username || user?.username)?.toLowerCase() || 'user'}
            </p>
          </div>

          {/* Profile Info */}
          <div className="profile-info-section">
            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">
                {userDetails?.email || user?.email || 'No email'}
              </span>
            </div>
            
            <div className="profile-info-item">
              <span className="profile-info-label">Member Since</span>
              <span className="profile-info-value">
                {userDetails?.created_at 
                  ? new Date(userDetails.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Unknown'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="profile-edit-btn" onClick={() => setShowEditModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Profile
            </button>
            
            <button onClick={handleLogout} className="profile-logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </div>
        </div>

      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={userDetails || user}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
};

export default Profile;
