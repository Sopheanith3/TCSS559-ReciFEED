import React, { useState } from 'react';
import './RecipeModal.css';
import { recipeService } from '../services/recipeService';

const RecipeModal = ({ isOpen, onClose, recipe, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !recipe) return null;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Get user info from localStorage (adjust based on your auth system)
    const userId = localStorage.getItem('userId') || 'user123';
    const username = localStorage.getItem('username') || 'Guest';

    if (!comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    try {
      setIsSubmitting(true);
      await recipeService.addReview(recipe.id, rating, comment, userId, username);
      
      // Reset form
      setComment('');
      setRating(5);
      
      // Notify parent to refresh recipes
      if (onReviewAdded) {
        onReviewAdded();
      }
      
      alert('Review added successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          {recipe.totalReviews > 0 && (
            <div className="recipe-modal__rating-badge">
              <span className="rating-star">★</span>
              <span className="rating-value">{recipe.averageRating.toFixed(1)}</span>
              <span className="rating-count">({recipe.totalReviews})</span>
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
              Reviews ({recipe.totalReviews || 0})
            </h3>

            {/* Add Review Form */}
            <div className="review-form">
              <h4 className="review-form__title">Write a Review</h4>
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
                <button 
                  type="submit" 
                  className="review-form__submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              {recipe.reviews && recipe.reviews.length > 0 ? (
                recipe.reviews.map((review, index) => (
                  <div key={index} className="review-item">
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
                      {renderStars(review.rating)}
                    </div>
                    <p className="review-item__comment">{review.comment}</p>
                  </div>
                ))
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
