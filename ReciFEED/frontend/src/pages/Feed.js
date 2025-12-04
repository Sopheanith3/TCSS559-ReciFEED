import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Feed.css';
import CreatePostModal from '../layout/CreatePostModal';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';


const Feed = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileDropdownRef = useRef(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  });
  const [commentInputs, setCommentInputs] = useState({}); // Track comment input per post
  const [expandedComments, setExpandedComments] = useState({}); // Track which posts have expanded comments

  // Modal state for full image view
  const [modalImage, setModalImage] = useState(null);
  
  // Profile dropdown state
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Close modal on ESC
  React.useEffect(() => {
    if (!modalImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalImage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = () => {
    logout();
    // Small delay to ensure state is cleared before navigation
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 0);
  };

  // Fetch feed posts from API
  const fetchFeed = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postService.getFeed(page, 20, 'created_at', 'desc');
      
      if (response.status === 'success') {
        // Get current user ID for like checking
        const currentUserId = user?.id || user?.userId;
        
        // Transform API data to match component structure
        const transformedPosts = response.data.posts.map(post => {
          // Check if current user has liked this post
          const userHasLiked = post.likes?.some(
            like => like.user_id.toString() === currentUserId
          ) || false;
          
          return {
            id: post._id,
            user: {
              name: post.username || 'Anonymous User',
              avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1535713875002-d1d0cf377fde' : '1494790108377-be9c29b29330'}?w=100`,
              username: `@${post.username || 'anonymous'}`.toLowerCase()
            },
            content: {
              text: post.body,
              images: post.image_urls || []
            },
            stats: {
              likes: post.likes?.length || 0,
              comments: post.comments?.length || 0
            },
            timestamp: formatTimestamp(post.created_at),
            isLikedByUser: userHasLiked,
            rawData: post // Keep original data for API operations
          };
        });

        setPosts(transformedPosts);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

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
      // Get actual userId from auth context
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      // Handle both id and userId properties for compatibility
      const userId = user.id || user.userId;
      const username = user.username || 'user';
      
      // Find the post to check if already liked
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const isLiked = post.isLikedByUser;
      
      // Optimistic update
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            stats: {
              ...p.stats,
              likes: isLiked ? p.stats.likes - 1 : p.stats.likes + 1
            },
            isLikedByUser: !isLiked
          };
        }
        return p;
      }));

      // API call - like or unlike based on current state
      if (isLiked) {
        await postService.unlikePost(postId, userId);
      } else {
        await postService.likePost(postId, userId, username);
      }
      
      // Refresh feed to get accurate data
      await fetchFeed(pagination.currentPage);
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert optimistic update on error
      await fetchFeed(pagination.currentPage);
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
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const commentText = commentInputs[postId]?.trim();
      if (!commentText) {
        console.log('Comment text is empty');
        return;
      }

      const userId = user.id || user.userId;
      const username = user.username || 'user';

      // Call API to add comment
      await postService.addComment(postId, commentText, userId, username);
      
      // Clear the comment input
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));
      
      // Refresh feed to show new comment
      await fetchFeed(pagination.currentPage);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment: ' + err.message);
    }
  };

  const toggleExpandComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="feed-page">
      <CreatePostModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      {/* Sticky Header */}
      <section className="feed-header">
        <div className="feed-header__content" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          {/* Left: Title */}
          <h1 className="feed-header__title" style={{ margin: 0, fontSize: '1.5rem', flex: '1' }}>ReciFEED Feed</h1>
          
          {/* Center: Navigation Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            {/* Home Icon */}
            <button 
              className="feed-header__icon-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'background 0.2s ease' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Home"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 12L12 4l9 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 10v10a1 1 0 0 0 1 1h4m4 0h4a1 1 0 0 0 1-1V10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Save/Bookmark Icon */}
            <button 
              className="feed-header__icon-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'background 0.2s ease' }}
              aria-label="Saved"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Create Post Icon */}
            <button 
              className="feed-header__icon-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'background 0.2s ease' }}
              onClick={() => setShowCreateModal(true)}
              aria-label="Create Post"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          {/* Right: User Profile Icon with Dropdown */}
          <div ref={profileDropdownRef} style={{ position: 'relative' }}>
            <button 
              className="feed-header__profile-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              aria-label="Profile"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '1rem' }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>
            
            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div style={{
                position: 'absolute',
                top: '50px',
                right: '0',
                backgroundColor: '#1a1a2e',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                minWidth: '200px',
                overflow: 'hidden',
                zIndex: 1000,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <p style={{ margin: 0, color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                    {user?.username || 'User'}
                  </p>
                  <p style={{ margin: '4px 0 0', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
                    @{user?.username?.toLowerCase() || 'user'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Posts - single column, no container/grid */}
      <div className="feed-main" style={{ maxWidth: '700px', margin: '32px auto', padding: '0 16px' }}>
        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>Loading feed...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
            <p>Error: {error}</p>
            <button 
              onClick={() => fetchFeed()} 
              style={{ 
                marginTop: '16px', 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer' 
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>No posts yet. Be the first to share!</p>
          </div>
        )}

        {/* Posts List */}
        {!loading && !error && posts.map((post) => (
          <article key={post.id} className="post-card">
            {/* Post Header */}
            <div className="post-card__header">
              <div className="post-card__user">
                <img 
                  src={post.user.avatar} 
                  alt={post.user.name} 
                  className="post-card__avatar"
                />
                <div className="post-card__user-info">
                  <h3 className="post-card__username">{post.user.name}</h3>
                  <p className="post-card__timestamp">{post.timestamp}</p>
                </div>
              </div>
              <button className="post-card__menu-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            {/* Post Content */}
            <div className="post-card__content">
              <p className="post-card__text">{post.content.text}</p>
              {/* Post Images */}
              <div className={`post-card__images ${post.content.images.length === 1 ? 'post-card__images--single' : 'post-card__images--grid'}`}>
                {post.content.images.map((image, index) => (
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
            </div>
            {/* Post Actions */}

            <div className="post-card__actions" style={{ alignItems: 'center', gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
              <button 
                className="post-card__action-btn"
                onClick={() => handleLike(post.id)}
                style={{ color: post.isLikedByUser ? '#ff4458' : 'rgba(255, 255, 255, 0.6)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={post.isLikedByUser ? '#ff4458' : 'none'}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{post.stats.likes}</span>
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
                  <span>{post.stats.comments}</span>
                </button>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(post.id);
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
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: commentInputs[post.id]?.trim() ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: commentInputs[post.id]?.trim() ? 'pointer' : 'not-allowed',
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
            {post.rawData.comments && post.rawData.comments.length > 0 && (
              <div style={{ 
                marginTop: '12px', 
                paddingTop: '12px', 
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {(expandedComments[post.id] ? post.rawData.comments : post.rawData.comments.slice(0, 2)).map((comment, idx) => (
                  <div key={idx} style={{ 
                    marginBottom: '8px', 
                    padding: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                        {comment.username || 'Anonymous'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {formatTimestamp(comment.created_at)}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {comment.text}
                    </p>
                  </div>
                ))}
                {post.rawData.comments.length > 2 && (
                  <button
                    onClick={() => toggleExpandComments(post.id)}
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
                    {expandedComments[post.id] 
                      ? 'View less comments' 
                      : `View more comments (${post.rawData.comments.length - 2} more)`}
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
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
    </div>
  );
};

export default Feed;