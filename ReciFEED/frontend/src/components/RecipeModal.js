import React, { useState } from 'react';
import '../styles/layout/RecipeModal.css';
import { recipeService } from '../services/recipeService';
import { recipeQueryService } from '../services/recipeQueryService';
import { useAuth } from '../context/AuthContext';

const RecipeModal = ({ isOpen, onClose, recipe, onReviewAdded, onEditRecipe }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [localReviews, setLocalReviews] = useState(recipe?.reviews || []);
  const [localTotalReviews, setLocalTotalReviews] = useState(recipe?.totalReviews || 0);
  const [localAverageRating, setLocalAverageRating] = useState(recipe?.averageRating || 0);
  const [showMenu, setShowMenu] = useState(false);
  
  // Recipe Q&A state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [questionError, setQuestionError] = useState('');

  // Update local state when recipe changes
  React.useEffect(() => {
    if (recipe) {
      setLocalReviews(recipe.reviews || []);
      setLocalTotalReviews(recipe.totalReviews || 0);
      setLocalAverageRating(recipe.averageRating || 0);
      // Reset Q&A when recipe changes
      setQuestion('');
      setAnswer('');
      setQuestionError('');
    }
  }, [recipe]);

  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await recipeService.deleteRecipe(recipe.id);
        onClose();
        if (onReviewAdded) {
          onReviewAdded(); // Refresh the recipe list
        }
      } catch (err) {
        console.error('Error deleting recipe:', err);
        alert('Failed to delete recipe');
      }
    }
    setShowMenu(false);
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    setQuestionError('');
    
    if (!question.trim()) {
      setQuestionError('Please enter a question');
      return;
    }

    try {
      setIsAsking(true);
      const response = await recipeQueryService.askQuestion(recipe, question);
      setAnswer(response.response);
    } catch (err) {
      console.error('Error asking question:', err);
      setQuestionError(err.message || 'Failed to get an answer. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Show three-dot menu if user owns this recipe */}
            {user && recipe.username === user.username && onEditRecipe && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                    <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
                {showMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '45px',
                    right: '0',
                    background: '#1a1a2e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                    minWidth: '140px',
                    overflow: 'hidden',
                    zIndex: 100
                  }}>
                    <button
                      onClick={() => {
                        onEditRecipe(recipe);
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.2s ease',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteRecipe}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
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
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            <button className="recipe-modal__close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
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

          {/* Recipe Q&A Section */}
          <div className="recipe-modal__section">
            <h3 className="recipe-modal__section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
              </svg>
              Ask About This Recipe
            </h3>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                Have questions about this recipe? Ask our AI assistant about ingredients, cooking times, substitutions, or anything else!
              </p>

              {/* Answer Display */}
              {answer && (
                <div style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: '#667eea',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      AI Assistant
                    </span>
                  </div>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    margin: 0,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {answer}
                  </p>
                </div>
              )}

              {/* Question Form */}
              <form onSubmit={handleAskQuestion}>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about this recipe..."
                    disabled={isAsking}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  />
                </div>

                {questionError && (
                  <div style={{
                    color: '#ff6b6b',
                    fontSize: '0.85rem',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {questionError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAsking || !question.trim()}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: isAsking || !question.trim() 
                      ? 'rgba(102, 126, 234, 0.3)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: isAsking || !question.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isAsking && question.trim()) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isAsking ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
                        animation: 'spin 1s linear infinite'
                      }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="15" opacity="0.25"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="15" opacity="0.75"/>
                      </svg>
                      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                      Asking...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ask Question
                    </>
                  )}
                </button>
              </form>
            </div>
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
            <div className="review-form" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h4 className="review-form__title" style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600' }}>Write a Review</h4>
              
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
                  <div className="review-form__rating" style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '500' }}>Your Rating:</label>
                    {renderStars(rating, true)}
                  </div>
                  <div className="review-form__comment" style={{ marginBottom: '16px' }}>
                    <textarea
                      placeholder="Share your experience with this recipe..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        minHeight: '100px',
                        boxSizing: 'border-box'
                      }}
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
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: isSubmitting || !comment.trim() ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: isSubmitting || !comment.trim() ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews List */}
            <div className="reviews-list" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
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
                    <div key={review._id || index} className="review-item" style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div className="review-item__header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div className="review-item__user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="review-item__avatar" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#fff'
                          }}>
                            {review.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="review-item__info">
                            <span className="review-item__username" style={{ 
                              display: 'block', 
                              fontWeight: '600', 
                              fontSize: '0.95rem',
                              color: '#fff'
                            }}>{review.username}</span>
                            <span className="review-item__date" style={{
                              fontSize: '0.85rem',
                              color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                      <p className="review-item__comment" style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        margin: 0,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                      }}>{review.comment}</p>
                    </div>
                  );
                })
              ) : (
                <div className="reviews-empty" style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.95rem'
                }}>
                  <p style={{ margin: 0 }}>No reviews yet. Be the first to review this recipe!</p>
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
