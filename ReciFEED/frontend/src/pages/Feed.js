import React, { useState } from 'react';
import '../components/Feed.css';

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'Lamine Yamal',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        username: '@lamineyamal'
      },
      content: {
        text: 'Chicken/Keema/Seafood/Mushroom/Vegetable/Spinach And Cheese/Lamb',
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
          'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500'
        ]
      },
      stats: {
        likes: 23,
        comments: 5
      },
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      user: {
        name: 'Hong Piao',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        username: '@hongpiao'
      },
      content: {
        text: 'Mushroom Curry & tortilla',
        images: [
          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500'
        ]
      },
      stats: {
        likes: 12,
        comments: 3
      },
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      user: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        username: '@sarahchen'
      },
      content: {
        text: 'Homemade Ramen Bowl 🍜',
        images: [
          'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500'
        ]
      },
      stats: {
        likes: 45,
        comments: 8
      },
      timestamp: '6 hours ago'
    },
    {
      id: 4,
      user: {
        name: 'Marco Rossi',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        username: '@marcorossi'
      },
      content: {
        text: 'Classic Margherita Pizza from scratch!',
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500'
        ]
      },
      stats: {
        likes: 67,
        comments: 12
      },
      timestamp: '8 hours ago'
    }
  ]);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          stats: {
            ...post.stats,
            likes: post.stats.likes + 1
          }
        };
      }
      return post;
    }));
  };

  return (
    <div className="feed-page">
      {/* Header (not sticky, not a nav, just a section) */}
      <section className="feed-header" style={{ position: 'static', borderBottom: 'none', boxShadow: 'none' }}>
        <div className="feed-header__content">
          <h1 className="feed-header__title">ReciFEED Feed</h1>
          <p className="feed-header__subtitle">Latest posts from the community</p>
        </div>
        <button className="feed-header__create-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create Post
        </button>
      </section>
      {/* Posts - single column, no container/grid */}
      <div className="feed-main" style={{ maxWidth: '700px', margin: '32px auto', padding: '0 16px' }}>
        {posts.map((post) => (
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
                      alt={`Post image ${index + 1}`} 
                      className="post-card__image"
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Post Actions */}
            <div className="post-card__actions">
              <button 
                className="post-card__action-btn"
                onClick={() => handleLike(post.id)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{post.stats.likes}</span>
              </button>
              <button className="post-card__action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{post.stats.comments}</span>
              </button>
              <button className="post-card__action-btn post-card__action-btn--share">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="post-card__action-btn post-card__action-btn--bookmark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Feed;