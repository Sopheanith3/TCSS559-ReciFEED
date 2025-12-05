import React, { useState, useEffect } from 'react';
import '../styles/layout/CreateRecipeModal.css'; // Reuse the same CSS
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

const EditRecipeModal = ({ isOpen, onClose, onRecipeUpdated, recipe }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    cooking_time: '',
    tags: '',
    ingredients: '',
    instructions: '',
    images: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form when recipe changes
  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        cooking_time: recipe.cookingTime || recipe.cooking_time || '',
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : '',
        images: recipe.image_urls ? 
          (Array.isArray(recipe.image_urls) ? recipe.image_urls.join('\n') : recipe.image_urls) : 
          (recipe.image ? recipe.image : '')
      });
    }
  }, [recipe]);

  if (!isOpen || !recipe) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate user is logged in
    if (!user) {
      setError('Please log in to edit a recipe');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Please provide a recipe title');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare recipe data matching backend schema
      const recipeData = {
        title: formData.title.trim(),
        cooking_time: formData.cooking_time.trim(),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        ingredients: formData.ingredients.split('\n').map(ing => ing.trim()).filter(ing => ing),
        instructions: formData.instructions.split('\n').map(inst => inst.trim()).filter(inst => inst),
        images: formData.images.split('\n').map(img => img.trim()).filter(img => img)
      };

      await recipeService.updateRecipe(recipe.id, recipeData);

      // Notify parent component
      if (onRecipeUpdated) {
        onRecipeUpdated();
      }

      onClose();
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err.message || 'Failed to update recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="create-recipe-modal-overlay" onClick={handleBackdropClick}>
      <div className="create-recipe-modal">
        <div className="create-recipe-modal__header">
          <h2>Edit Recipe</h2>
          <button
            className="create-recipe-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form className="create-recipe-modal__form" onSubmit={handleSubmit}>
          {error && (
            <div className="create-recipe-modal__error">
              {error}
            </div>
          )}

          <div className="create-recipe-modal__field">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Chocolate Chip Cookies"
              required
            />
          </div>
          <div className="create-recipe-modal__field">
            <label htmlFor="cooking_time">Cooking Time</label>
            <input
              type="text"
              id="cooking_time"
              name="cooking_time"
              value={formData.cooking_time}
              onChange={handleChange}
              placeholder="e.g., 45mins"
            />
          </div>

          <div className="create-recipe-modal__field">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., dessert, baking, cookies (comma-separated)"
            />
            <small>Separate tags with commas</small>
          </div>

          <div className="create-recipe-modal__field">
            <label htmlFor="ingredients">Ingredients</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="2 cups flour&#10;1 cup sugar&#10;2 eggs&#10;..."
              rows="6"
            />
            <small>One ingredient per line</small>
          </div>

          <div className="create-recipe-modal__field">
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Preheat oven to 350°F&#10;Mix dry ingredients...&#10;..."
              rows="8"
            />
            <small>One instruction per line</small>
          </div>

          <div className="create-recipe-modal__field">
            <label htmlFor="images">Image URLs</label>
            <textarea
              id="images"
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;..."
              rows="3"
            />
            <small>One URL per line</small>
          </div>

          <div className="create-recipe-modal__actions">
            <button
              type="button"
              className="create-recipe-modal__cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-recipe-modal__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipeModal;
