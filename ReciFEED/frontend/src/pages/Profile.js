import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../layout/EditProfileModal';
import { postService } from '../services/postService';
import '../components/Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDropdowns, setCommentDropdowns] = useState({});
  const [postDropdowns, setPostDropdowns] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'recipes'

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

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      let userId = user?.id || user?.userId;
      if (typeof userId === 'object') {
        userId = userId._id || userId.id;
      }
      
      console.log('Fetching posts for userId:', userId);
      const response = await postService.getPostsByUser(userId, 1, 50);
      console.log('Posts response:', response);
      
      // Handle different response structures
      const postsData = Array.isArray(response) ? response : 
                   Array.isArray(response.data?.posts) ? response.data.posts :
                   Array.isArray(response.data) ? response.data :
                   Array.isArray(response.posts) ? response.posts : [];
      
      // Transform MongoDB posts to match Feed format with proper image_urls
      const transformedPosts = postsData.map(post => ({
        id: post._id,
        _id: post._id,
        content: post.body,
        body: post.body,
        image_urls: post.image_urls || [],
        user_id: post.user_id,
        username: post.username,
        created_at: post.created_at,
        likes: post.likes || [],
        comments: post.comments || [],
        isLikedByUser: (post.likes || []).some(like => 
          like.user_id.toString() === userId.toString()
        ),
        stats: {
          likes: (post.likes || []).length,
          comments: (post.comments || []).length
        },
        timestamp: formatTimestamp(post.created_at),
        rawData: post
      }));
      
      console.log('Transformed posts with images:', transformedPosts);
      setUserPosts(transformedPosts);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setUserPosts([]); // Set empty array on error
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch posts when component mounts
  useEffect(() => {
    if (user && userPosts.length === 0) {
      fetchUserPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Close modal on ESC
  useEffect(() => {
    if (!modalImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalImage]);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async (postId) => {
    try {
      if (!user) return;
      
      let userId = user.id || user.userId;
      if (typeof userId === 'object') {
        userId = userId.id || userId.userId || userId._id;
      }
      userId = String(userId);
      const username = user.username || 'user';
      
      const post = userPosts.find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.isLikedByUser;
      
      // Optimistically update UI
      setUserPosts(userPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLikedByUser: !isLiked,
            stats: {
              ...p.stats,
              likes: isLiked ? p.stats.likes - 1 : p.stats.likes + 1
            }
          };
        }
        return p;
      }));

      // API call
      if (isLiked) {
        await postService.unlikePost(postId, userId);
      } else {
        await postService.likePost(postId, userId, username);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      await fetchUserPosts();
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleAddComment = async (postId) => {
    try {
      if (!user) return;

      const commentText = commentInputs[postId]?.trim();
      if (!commentText) return;

      let userId = user.id || user.userId;
      if (typeof userId === 'object') {
        userId = userId.id || userId.userId || userId._id;
      }
      userId = String(userId);
      const username = user.username || 'user';

      const newComment = {
        user_id: userId,
        username: username,
        created_at: new Date(),
        text: commentText
      };

      // Optimistically update UI
      setUserPosts(userPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            rawData: {
              ...p.rawData,
              comments: [...(p.rawData.comments || []), newComment]
            },
            stats: {
              ...p.stats,
              comments: p.stats.comments + 1
            }
          };
        }
        return p;
      }));
      
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));

      await postService.addComment(postId, commentText, userId, username);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment: ' + err.message);
      await fetchUserPosts();
    }
  };

  const toggleExpandComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleCommentDropdown = (postId, commentIndex) => {
    const key = `${postId}-${commentIndex}`;
    setCommentDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteComment = async (postId, commentIndex) => {
    try {
      if (!user) return;

      const post = userPosts.find(p => p.id === postId);
      if (!post) return;

      const comment = post.rawData.comments[commentIndex];
      if (!comment) return;

      let userId = user.id || user.userId;
      if (typeof userId === 'object') {
        userId = userId.id || userId.userId || userId._id;
      }
      userId = String(userId);

      if (comment.user_id.toString() !== userId) {
        alert('You can only delete your own comments');
        return;
      }

      const key = `${postId}-${commentIndex}`;
      setCommentDropdowns(prev => ({
        ...prev,
        [key]: false
      }));

      // Optimistically update UI
      setUserPosts(userPosts.map(p => {
        if (p.id === postId) {
          const updatedComments = [...p.rawData.comments];
          updatedComments.splice(commentIndex, 1);
          return {
            ...p,
            rawData: {
              ...p.rawData,
              comments: updatedComments
            },
            stats: {
              ...p.stats,
              comments: p.stats.comments - 1
            }
          };
        }
        return p;
      }));

      const commentId = comment._id;
      await postService.deleteComment(postId, commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment: ' + err.message);
      await fetchUserPosts();
    }
  };

  const togglePostDropdown = (postId) => {
    setPostDropdowns(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleDeletePost = async (postId) => {
    try {
      if (!user) return;

      const post = userPosts.find(p => p.id === postId);
      if (!post) return;

      let userId = user.id || user.userId;
      if (typeof userId === 'object') {
        userId = userId.id || userId.userId || userId._id;
      }
      userId = String(userId);

      if (post.rawData.user_id.toString() !== userId) {
        alert('You can only delete your own posts');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this post?')) {
        return;
      }

      setPostDropdowns(prev => ({
        ...prev,
        [postId]: false
      }));

      // Optimistically remove post from UI
      setUserPosts(userPosts.filter(p => p.id !== postId));

      await postService.deletePost(postId);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post: ' + err.message);
      await fetchUserPosts();
    }
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

        {/* Tabbed Section - Posts & Recipes */}
        <div className="profile-tabbed-section">
          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button 
              className={`profile-tab ${activeTab === 'posts' ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 7h10M7 12h10M7 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Posts
              <span className="profile-tab-count">{userPosts.length}</span>
            </button>
            {/* Recipes tab disabled for now */}
            {/* <button 
              className={`profile-tab ${activeTab === 'recipes' ? 'profile-tab--active' : ''}`}
              onClick={() => setActiveTab('recipes')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Recipes
              <span className="profile-tab-count">0</span>
            </button> */}
          </div>

          {/* Tab Content */}
          <div className="profile-content">

          {/* Posts Tab Content */}
          {activeTab === 'posts' && (
            <>
              {postsLoading ? (
                <div className="profile-loading-content">
                  <div className="spinner"></div>
                  <p>Loading posts...</p>
                </div>
              ) : userPosts.length === 0 ? (
            <div className="profile-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 7h10M7 12h10M7 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>No posts yet</p>
              <button onClick={() => navigate('/feed')} className="profile-cta-btn">
                Create your first post
              </button>
            </div>
          ) : (
            <div className="profile-posts-list">
              {userPosts.map((post) => {
                let userId = user?.id || user?.userId;
                if (typeof userId === 'object') {
                  userId = userId._id || userId.toString();
                }
                userId = String(userId);
                
                // Extract post ID - MongoDB returns _id
                const postId = post._id || post.id;
                
                // Extract images from backend structure (image_urls field)
                const images = post.image_urls || [];
                
                const isOwnPost = post.user_id?.toString() === userId;

                return (
                  <article key={postId} className="post-card">
                    {/* Post Header */}
                    <div className="post-card__header">
                      <div className="post-card__user">
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#fff', 
                          fontWeight: '600', 
                          fontSize: '1rem'
                        }}>
                          {(post.username || userDetails?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="post-card__user-info">
                          <h3 className="post-card__username">{post.username || userDetails?.username || 'User'}</h3>
                          <p className="post-card__timestamp">{post.timestamp || formatTimestamp(post.created_at)}</p>
                        </div>
                      </div>
                      {isOwnPost && (
                        <div style={{ position: 'relative' }} data-post-dropdown>
                          <button 
                            className="post-card__menu-btn"
                            onClick={() => togglePostDropdown(postId)}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                              <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                            </svg>
                          </button>
                          {postDropdowns[postId] && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: '0',
                              backgroundColor: '#1a1a2e',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                              minWidth: '150px',
                              overflow: 'hidden',
                              zIndex: 1000,
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              marginTop: '4px'
                            }}>
                              <button
                                onClick={() => handleDeletePost(postId)}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#ff4458',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontSize: '0.9rem',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 88, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                Delete Post
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="post-card__content">
                      <p className="post-card__text">{post.body || post.content?.text || post.content || ''}</p>
                      {images.length > 0 && (
                        <div className={`post-card__images ${images.length === 1 ? 'post-card__images--single' : 'post-card__images--grid'}`}>
                          {images.map((image, index) => (
                            <div key={index} className="post-card__image-wrapper">
                              <img
                                src={image}
                                alt={`Post content ${index + 1}`}
                                className="post-card__image"
                                onClick={() => setModalImage(image)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="post-card__actions" style={{ alignItems: 'center', gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
                      <button 
                        className="post-card__action-btn"
                        onClick={() => handleLike(postId)}
                        style={{ color: post.isLikedByUser ? '#ff4458' : 'rgba(255, 255, 255, 0.6)' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLikedByUser ? '#ff4458' : 'none'}>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{post.stats?.likes || 0}</span>
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <button 
                          className="post-card__action-btn"
                          style={{ display: 'flex', alignItems: 'center' }}
                          tabIndex={-1}
                          disabled
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>{post.stats?.comments || 0}</span>
                        </button>
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[postId] || ''}
                          onChange={(e) => handleCommentChange(postId, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(postId);
                            }
                          }}
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: '8px 12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(postId)}
                          disabled={!commentInputs[postId]?.trim()}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: commentInputs[postId]?.trim() ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: commentInputs[postId]?.trim() ? 'pointer' : 'not-allowed',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            fontFamily: 'inherit'
                          }}
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Display Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div style={{ 
                        marginTop: '12px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>
                        {(expandedComments[postId] ? post.comments : post.comments.slice(0, 2)).map((comment, idx) => {
                          const commentKey = `${postId}-${idx}`;
                          let currentUserId = user?.id || user?.userId;
                          if (typeof currentUserId === 'object') {
                            currentUserId = currentUserId.id || currentUserId.userId || currentUserId._id;
                          }
                          currentUserId = String(currentUserId);
                          const isOwnComment = comment.user_id.toString() === currentUserId;

                          return (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              padding: '8px 0',
                              position: 'relative'
                            }}>
                              <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#fff', 
                                fontWeight: '600', 
                                fontSize: '0.85rem',
                                flexShrink: 0
                              }}>
                                {comment.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                  padding: '8px 12px', 
                                  borderRadius: '12px',
                                  position: 'relative'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                                    <p style={{ 
                                      margin: 0, 
                                      fontWeight: '600', 
                                      fontSize: '0.9rem', 
                                      color: 'rgba(255, 255, 255, 0.9)'
                                    }}>
                                      {comment.username}
                                    </p>
                                    {isOwnComment && (
                                      <div style={{ position: 'relative' }} data-comment-dropdown>
                                        <button
                                          onClick={() => toggleCommentDropdown(postId, idx)}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            cursor: 'pointer',
                                            padding: '0 4px',
                                            fontSize: '1.2rem',
                                            lineHeight: 1
                                          }}
                                        >
                                          ⋯
                                        </button>
                                        {commentDropdowns[commentKey] && (
                                          <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: '0',
                                            backgroundColor: '#1a1a2e',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                            minWidth: '120px',
                                            overflow: 'hidden',
                                            zIndex: 1000,
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            marginTop: '4px'
                                          }}>
                                            <button
                                              onClick={() => handleDeleteComment(postId, idx)}
                                              style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: '#ff4458',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                fontSize: '0.85rem',
                                                transition: 'background-color 0.2s'
                                              }}
                                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 88, 0.1)'}
                                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <p style={{ 
                                    margin: 0, 
                                    fontSize: '0.9rem', 
                                    color: 'rgba(255, 255, 255, 0.8)', 
                                    wordBreak: 'break-word'
                                  }}>
                                    {comment.text}
                                  </p>
                                </div>
                                <p style={{ 
                                  margin: '4px 0 0 12px', 
                                  fontSize: '0.75rem', 
                                  color: 'rgba(255, 255, 255, 0.4)'
                                }}>
                                  {formatTimestamp(comment.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        {post.comments.length > 2 && (
                          <button
                            onClick={() => toggleExpandComments(postId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(255, 255, 255, 0.6)',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              padding: '4px 0',
                              marginTop: '4px',
                              fontFamily: 'inherit',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
                          >
                            {expandedComments[postId] 
                              ? 'View less comments' 
                              : `View more comments (${post.comments.length - 2} more)`}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
            </>
          )}

          {/* Recipes Tab Content */}
          {activeTab === 'recipes' && (
            <div className="profile-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>No recipes yet</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.3)', marginTop: '-16px' }}>Recipe functionality coming soon!</p>
            </div>
          )}
          </div>
        </div>

      </div>

      {/* Full Image Modal */}
      {modalImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Full post"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              background: '#222',
            }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setModalImage(null)}
            style={{
              position: 'fixed',
              top: 24,
              right: 32,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              fontSize: 24,
              cursor: 'pointer',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close image"
          >
            &times;
          </button>
        </div>
      )}

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
