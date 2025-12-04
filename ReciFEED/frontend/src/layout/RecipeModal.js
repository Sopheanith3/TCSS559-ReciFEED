import React, { useState } from 'react';
import './RecipeModal.css';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

const RecipeModal = ({ isOpen, onClose, recipe, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [localReviews, setLocalReviews] = useState(recipe?.reviews || []);
  const [localTotalReviews, setLocalTotalReviews] = useState(recipe?.totalReviews || 0);
  const [localAverageRating, setLocalAverageRating] = useState(recipe?.averageRating || 0);

  // Update local state when recipe changes
  React.useEffect(() => {
    if (recipe) {
      setLocalReviews(recipe.reviews || []);
      setLocalTotalReviews(recipe.totalReviews || 0);
      setLocalAverageRating(recipe.averageRating || 0);
    }
  }, [recipe]);

  if (!isOpen || !recipe) return null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if user is logged in
    if (!user) {
      setError('Please log in to submit a review');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a review comment');
      return;
    }

    // Extract userId as string, handling different user object structures
    let userId = user.id || user.userId;
    if (typeof userId === 'object') {
      userId = userId.id || userId.userId || userId._id;
    }
    userId = String(userId);
    const username = user.username || 'Anonymous';

    // Create optimistic review
    const optimisticReview = {
      _id: `temp-${Date.now()}`,
      user_id: userId,
      username: username,
      rating: rating,
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };

    // Optimistically update UI
    const updatedReviews = [...localReviews, optimisticReview];
    setLocalReviews(updatedReviews);
    setLocalTotalReviews(localTotalReviews + 1);
    
    // Calculate new average
    const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAverage = totalRating / updatedReviews.length;
    setLocalAverageRating(newAverage);
    
    // Reset form immediately
    const submittedComment = comment;
    const submittedRating = rating;
    setComment('');
    setRating(5);

    try {
      setIsSubmitting(true);
      
      // Call API in background
      const response = await recipeService.addReview(recipe.id, submittedRating, submittedComment, userId, username);
      
      // Update with real review data from server
      const serverReview = response.data.review;
      setLocalReviews(prev => prev.map(r => 
        r._id === optimisticReview._id ? serverReview : r
      ));
      
      // Optionally refresh parent to update recipe list
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.message || 'Failed to submit review. Please try again.';
      
      // Revert optimistic update on error
      setLocalReviews(localReviews);
      setLocalTotalReviews(localTotalReviews);
      setLocalAverageRating(localAverageRating);
      
      // Restore form values
      setComment(submittedComment);
      setRating(submittedRating);
      
      // Check for specific error messages
      if (errorMessage.includes('already reviewed')) {
        setError('You have already reviewed this recipe');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    // Find the review to delete
    const reviewToDelete = localReviews.find(r => r._id === reviewId);
    if (!reviewToDelete) return;

    // Optimistically remove review from UI
    const updatedReviews = localReviews.filter(r => r._id !== reviewId);
    setLocalReviews(updatedReviews);
    setLocalTotalReviews(Math.max(0, localTotalReviews - 1));
    
    // Recalculate average rating
    if (updatedReviews.length > 0) {
      const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
      const newAverage = totalRating / updatedReviews.length;
      setLocalAverageRating(newAverage);
    } else {
      setLocalAverageRating(0);
    }

    try {
      // Call API in background
      await recipeService.deleteReview(recipe.id, reviewId);
      
      // Notify parent to refresh recipes
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      
      // Revert optimistic update on error
      setLocalReviews(localReviews);
      setLocalTotalReviews(localTotalReviews);
      setLocalAverageRating(localAverageRating);
      
      setError('Failed to delete review. Please try again.');
    }
  };

  const renderStars = (currentRating, isInteractive = false) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (isInteractive ? (hoveredRating || rating) : currentRating) ? 'filled' : ''}`}
            onClick={isInteractive ? () => setRating(star) : undefined}
            onMouseEnter={isInteractive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={isInteractive ? () => setHoveredRating(0) : undefined}
            style={{ cursor: isInteractive ? 'pointer' : 'default' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (

    <div className="recipe-modal-overlay" onClick={onClose}>
      <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="recipe-modal__header">
          <h2 className="recipe-modal__title">{recipe.title}</h2>
          <button className="recipe-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* User/Author Container Above Image */}
        <div className="recipe-modal__meta" style={{marginBottom: 0}}>
          <div className="recipe-modal__author">
            <div className="recipe-modal__author-avatar">
              {recipe.username ? recipe.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="recipe-modal__author-info">
              <span className="recipe-modal__author-name">
                {recipe.username || 'Unknown Chef'}
              </span>
              <span className="recipe-modal__author-date">
                {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Date unknown'}
              </span>
            </div>
          </div>
          {localTotalReviews > 0 && (
            <div className="recipe-modal__rating-badge">
              <span className="rating-star">★</span>
              <span className="rating-value">{localAverageRating.toFixed(1)}</span>
              <span className="rating-count">({localTotalReviews})</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="recipe-modal__body">
          {/* Recipe Image */}
          <div className="recipe-modal__image-container">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="recipe-modal__image"
            />
            {/* Recipe Tags Overlay */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="recipe-modal__tags-overlay">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="recipe-modal__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Recipe Info Cards */}
          <div className="recipe-modal__info">
            <div className="recipe-modal__info-grid">
              {recipe.cookingTime && (
                <div className="recipe-modal__info-card">
                  <div className="info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="info-card__content">
                    <span className="info-card__label">Cooking Time</span>
                    <span className="info-card__value">{recipe.cookingTime}</span>
                  </div>
                </div>
              )}
              {recipe.servings && (
                <div className="recipe-modal__info-card">
                  <div className="info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="info-card__content">
                    <span className="info-card__label">Servings</span>
                    <span className="info-card__value">{recipe.servings} people</span>
                  </div>
                </div>
              )}
              {recipe.level && (
                <div className="recipe-modal__info-card">
                  <div className="info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="info-card__content">
                    <span className="info-card__label">Difficulty</span>
                    <span className="info-card__value">{recipe.level}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="recipe-modal__section">
            <h3 className="recipe-modal__section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ingredients
            </h3>
            <ul className="recipe-modal__ingredients-list">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="recipe-modal__ingredient-item">
                    <span className="recipe-modal__ingredient-bullet">•</span>
                    {ingredient}
                  </li>
                ))
              ) : (
                <li className="recipe-modal__ingredient-item">
                  <span className="recipe-modal__ingredient-bullet">•</span>
                  No ingredients listed
                </li>
              )}
            </ul>
          </div>

          {/* Instructions Section */}
          <div className="recipe-modal__section">
            <h3 className="recipe-modal__section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Instructions
            </h3>
            <ol className="recipe-modal__instructions-list">
              {recipe.instructions && recipe.instructions.length > 0 ? (
                recipe.instructions.map((instruction, index) => (
                  <li key={index} className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">{index + 1}</span>
                    <p className="recipe-modal__instruction-text">{instruction}</p>
                  </li>
                ))
              ) : (
                <li className="recipe-modal__instruction-item">
                  <span className="recipe-modal__instruction-number">1</span>
                  <p className="recipe-modal__instruction-text">
                    No instructions available for this recipe.
                  </p>
                </li>
              )}
            </ol>
          </div>

          {/* Reviews Section */}
          <div className="recipe-modal__section">
            <h3 className="recipe-modal__section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Reviews ({localTotalReviews})
            </h3>

            {/* Add Review Form */}
            <div className="review-form">
              <h4 className="review-form__title">Write a Review</h4>
              
              {!user ? (
                <div style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center'
                }}>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    marginBottom: '12px',
                    fontSize: '0.95rem'
                  }}>
                    Please log in to write a review
                  </p>
                  <button
                    onClick={onClose}
                    style={{
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    Close & Log In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="review-form__rating">
                    <label>Your Rating:</label>
                    {renderStars(rating, true)}
                  </div>
                  <div className="review-form__comment">
                    <textarea
                      placeholder="Share your experience with this recipe..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {error && (
                    <div style={{
                      color: '#ff6b6b',
                      fontSize: '0.9rem',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255, 107, 107, 0.15)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="review-form__submit"
                    disabled={isSubmitting || !comment.trim()}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              {localReviews && localReviews.length > 0 ? (
                localReviews.map((review, index) => {
                  // Check if current user owns this review
                  let currentUserId = user?.id || user?.userId;
                  if (typeof currentUserId === 'object') {
                    currentUserId = currentUserId.id || currentUserId.userId || currentUserId._id;
                  }
                  currentUserId = String(currentUserId);
                  const isOwnReview = user && review.user_id?.toString() === currentUserId;

                  return (
                    <div key={review._id || index} className="review-item">
                      <div className="review-item__header">
                        <div className="review-item__user">
                          <div className="review-item__avatar">
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="review-item__info">
                            <span className="review-item__username">{review.username}</span>
                            <span className="review-item__date">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {renderStars(review.rating)}
                          {isOwnReview && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              style={{
                                background: 'rgba(255, 68, 88, 0.1)',
                                border: '1px solid rgba(255, 68, 88, 0.3)',
                                color: '#ff4458',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 68, 88, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 68, 88, 0.1)';
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="review-item__comment">{review.comment}</p>
                    </div>
                  );
                })
              ) : (
                <div className="reviews-empty">
                  <p>No reviews yet. Be the first to review this recipe!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
