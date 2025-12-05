import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import '../styles/components/Profile.css';
import { analyticsService } from '../services/analyticsService';

const UserProfile = () => {
  const { userId } = useParams(); // Get userId from URL
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDropdowns, setCommentDropdowns] = useState({});
  const [postDropdowns, setPostDropdowns] = useState({});
  const [modalImage, setModalImage] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log('Fetching user details for userId:', userId);
        
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

        // Log user analytics event
        await analyticsService.log('user_view', { id: userId, label: data.data.username });
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  // Fetch user posts
  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      
      console.log('Fetching posts for userId:', userId);
      
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await postService.getPostsByUser(userId);
      console.log('User posts response:', response);

      if (response.status === 'success' && response.data) {
        setUserPosts(response.data.posts || []);
      } else {
        setUserPosts([]);
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Fetch posts when component mounts
  useEffect(() => {
    if (userId) {
      fetchUserPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && modalImage) {
        setModalImage(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalImage]);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const handleLike = async (postId) => {
    try {
      let currentUserId = user?.id || user?.userId;
      if (typeof currentUserId === 'object') {
        currentUserId = currentUserId._id || currentUserId.id;
      }
      currentUserId = String(currentUserId);

      const username = user?.username || 'Anonymous';

      const postIndex = userPosts.findIndex(p => {
        const pId = p._id || p.id;
        return String(pId) === String(postId);
      });

      if (postIndex === -1) {
        console.error('Post not found');
        return;
      }

      const post = userPosts[postIndex];
      const hasLiked = post.likes?.some(like => String(like.user_id) === currentUserId);

      const updatedPosts = [...userPosts];

      if (hasLiked) {
        await postService.unlikePost(postId, currentUserId);
        updatedPosts[postIndex] = {
          ...post,
          likes: post.likes.filter(like => String(like.user_id) !== currentUserId)
        };
      } else {
        await postService.likePost(postId, currentUserId, username);
        updatedPosts[postIndex] = {
          ...post,
          likes: [...(post.likes || []), {
            user_id: currentUserId,
            username: username,
            created_at: new Date().toISOString()
          }]
        };
      }

      setUserPosts(updatedPosts);
    } catch (err) {
      console.error('Error toggling like:', err);
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
      const commentText = commentInputs[postId]?.trim();
      if (!commentText) return;

      let currentUserId = user?.id || user?.userId;
      if (typeof currentUserId === 'object') {
        currentUserId = currentUserId._id || currentUserId.id;
      }
      currentUserId = String(currentUserId);

      const username = user?.username || 'Anonymous';

      const response = await postService.addComment(postId, commentText, currentUserId, username);

      if (response.status === 'success' && response.data) {
        const updatedPosts = userPosts.map(post => {
          const pId = post._id || post.id;
          if (String(pId) === String(postId)) {
            return {
              ...post,
              comments: [...(post.comments || []), response.data]
            };
          }
          return post;
        });

        setUserPosts(updatedPosts);
        setCommentInputs(prev => ({
          ...prev,
          [postId]: ''
        }));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
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
      const post = userPosts.find(p => {
        const pId = p._id || p.id;
        return String(pId) === String(postId);
      });

      if (!post || !post.comments || !post.comments[commentIndex]) {
        console.error('Comment not found');
        return;
      }

      const comment = post.comments[commentIndex];
      const commentId = comment._id || comment.id;

      if (!commentId) {
        console.error('Comment ID not found');
        return;
      }

      await postService.deleteComment(postId, commentId);

      const updatedPosts = userPosts.map(p => {
        const pId = p._id || p.id;
        if (String(pId) === String(postId)) {
          return {
            ...p,
            comments: p.comments.filter((_, idx) => idx !== commentIndex)
          };
        }
        return p;
      });

      setUserPosts(updatedPosts);
      setCommentDropdowns(prev => {
        const key = `${postId}-${commentIndex}`;
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const togglePostDropdown = (postId) => {
    setPostDropdowns(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);

      setUserPosts(prevPosts => prevPosts.filter(post => {
        const pId = post._id || post.id;
        return String(pId) !== String(postId);
      }));

      setPostDropdowns(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner-container">
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

  // Check if viewing own profile
  let currentUserId = user?.id || user?.userId;
  if (typeof currentUserId === 'object') {
    currentUserId = currentUserId._id || currentUserId.id;
  }
  const isOwnProfile = String(currentUserId) === String(userId);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">{isOwnProfile ? 'My Profile' : `${userDetails?.username || 'User'}'s Profile`}</h1>
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
              {userDetails?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="profile-username">
              {userDetails?.username || 'User'}
            </h2>
            <p className="profile-handle">
              @{(userDetails?.username)?.toLowerCase() || 'user'}
            </p>
          </div>

          {/* Profile Info */}
          <div className="profile-info-section">
            <div className="profile-info-item">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">
                {userDetails?.email || 'No email'}
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

          {/* Action Buttons - Only show if viewing own profile */}
          {isOwnProfile && (
            <div className="profile-actions">
              <button className="profile-edit-btn" onClick={() => navigate('/profile')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Go to My Profile
              </button>
            </div>
          )}
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
                  </div>
                ) : (
                  <div className="profile-posts-list">
                    {userPosts.map((post) => {
                      const postId = post._id || post.id;
                      const images = post.image_urls || [];
                      const postUserId = String(post.user_id);
                      const isOwnPost = postUserId === String(currentUserId);

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
                                    padding: '8px',
                                    minWidth: '150px',
                                    zIndex: 1000
                                  }}>
                                    <button
                                      onClick={() => handleDeletePost(postId)}
                                      style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#ff4444',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s'
                                      }}
                                      onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'}
                                      onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
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
                            <p className="post-card__text">{post.body || post.content}</p>

                            {/* Post Images */}
                            {images.length > 0 && (
                              <div className={`post-card__images ${images.length === 1 ? 'post-card__images--single' : 'post-card__images--grid'}`}>
                                {images.map((imageUrl, idx) => (
                                  <div key={idx} className="post-card__image-wrapper">
                                    <img 
                                      src={imageUrl} 
                                      alt={`Post image ${idx + 1}`}
                                      className="post-card__image"
                                      onClick={() => setModalImage(imageUrl)}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Post Actions */}
                          <div className="post-card__actions">
                            <button 
                              className="post-card__action-btn"
                              onClick={() => handleLike(postId)}
                              style={{ 
                                color: post.likes?.some(like => String(like.user_id) === String(currentUserId)) 
                                  ? '#ff6b6b' 
                                  : 'rgba(255, 255, 255, 0.55)' 
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likes?.some(like => String(like.user_id) === String(currentUserId)) ? 'currentColor' : 'none'}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {post.likes?.length || 0}
                            </button>

                            <button 
                              className="post-card__action-btn"
                              onClick={() => toggleExpandComments(postId)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {post.comments?.length || 0}
                            </button>
                          </div>

                          {/* Comments Section */}
                          {expandedComments[postId] && (
                            <div className="post-card__comments">
                              {post.comments && post.comments.length > 0 && (
                                <div className="post-card__comments-list">
                                  {post.comments.map((comment, idx) => {
                                    const isOwnComment = String(comment.user_id) === String(currentUserId);
                                    return (
                                      <div key={idx} className="comment">
                                        <div className="comment__header">
                                          <div className="comment__user">
                                            <div className="comment__user-avatar">
                                              {(comment.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="comment__user-info">
                                              <span className="comment__username">{comment.username || 'Anonymous'}</span>
                                              <span className="comment__timestamp">{formatTimestamp(comment.created_at)}</span>
                                            </div>
                                          </div>
                                          {isOwnComment && (
                                            <div style={{ position: 'relative' }} data-comment-dropdown>
                                              <button
                                                onClick={() => toggleCommentDropdown(postId, idx)}
                                                style={{
                                                  background: commentDropdowns[`${postId}-${idx}`] ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                                  border: 'none',
                                                  color: commentDropdowns[`${postId}-${idx}`] ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                                                  cursor: 'pointer',
                                                  padding: '6px 8px',
                                                  borderRadius: '6px',
                                                  transition: 'all 0.2s ease',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center'
                                                }}
                                                onMouseOver={(e) => {
                                                  if (!commentDropdowns[`${postId}-${idx}`]) {
                                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                                  }
                                                  e.currentTarget.style.color = '#ffffff';
                                                }}
                                                onMouseOut={(e) => {
                                                  if (!commentDropdowns[`${postId}-${idx}`]) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                                                  }
                                                }}
                                              >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                  <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                                                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                                                  <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                                                </svg>
                                              </button>
                                              {commentDropdowns[`${postId}-${idx}`] && (
                                                <div style={{
                                                  position: 'absolute',
                                                  top: 'calc(100% + 4px)',
                                                  right: '0',
                                                  backgroundColor: '#1a1a2e',
                                                  borderRadius: '8px',
                                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                                                  padding: '4px',
                                                  minWidth: '160px',
                                                  zIndex: 1000,
                                                  border: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}>
                                                  <button
                                                    onClick={() => handleDeleteComment(postId, idx)}
                                                    style={{
                                                      width: '100%',
                                                      padding: '10px 14px',
                                                      backgroundColor: 'transparent',
                                                      color: '#ff6b6b',
                                                      border: 'none',
                                                      borderRadius: '6px',
                                                      cursor: 'pointer',
                                                      fontSize: '0.9rem',
                                                      fontWeight: '500',
                                                      textAlign: 'left',
                                                      transition: 'all 0.2s ease',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '8px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                      e.target.style.backgroundColor = 'rgba(255, 107, 107, 0.15)';
                                                      e.target.style.color = '#ff4444';
                                                    }}
                                                    onMouseOut={(e) => {
                                                      e.target.style.backgroundColor = 'transparent';
                                                      e.target.style.color = '#ff6b6b';
                                                    }}
                                                  >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    Delete Comment
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <p className="comment__text">{comment.text}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Add Comment Input */}
                              <div className="post-card__comment-input">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentInputs[postId] || ''}
                                  onChange={(e) => handleCommentChange(postId, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(postId);
                                    }
                                  }}
                                />
                                <button 
                                  onClick={() => handleAddComment(postId)}
                                  disabled={!commentInputs[postId]?.trim()}
                                >
                                  Post
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
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
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            ×
          </button>
          <img 
            src={modalImage} 
            alt="Full size" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
