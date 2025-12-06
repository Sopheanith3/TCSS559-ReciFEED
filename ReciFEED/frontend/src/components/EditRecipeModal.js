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
  const [uploadMethod, setUploadMethod] = useState('url'); // 'upload' or 'url'
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Populate form when recipe changes
  useEffect(() => {
    if (recipe) {
      const imagesData = recipe.image_urls ? 
        (Array.isArray(recipe.image_urls) ? recipe.image_urls.join('\n') : recipe.image_urls) : 
        (recipe.image ? recipe.image : '');
      
      setFormData({
        title: recipe.title || '',
        cooking_time: recipe.cookingTime || recipe.cooking_time || '',
        tags: Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '',
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join('\n') : '',
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : '',
        images: imagesData
      });

      // Check if existing images are URLs or base64
      const firstImage = recipe.image_urls && recipe.image_urls.length > 0 ? recipe.image_urls[0] : recipe.image;
      if (firstImage) {
        if (typeof image === 'string' && (firstImage.startsWith('http://') || firstImage.startsWith('https://'))) {
          setUploadMethod('url');
          setImagePreview(null);
          setUploadedImages([]);
        } else {
          setUploadMethod('upload');
          setImagePreview(firstImage);
          setUploadedImages([firstImage]);
        }
      } else {
        setUploadMethod('url');
        setImagePreview(null);
        setUploadedImages([]);
      }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Store the actual File object (multer will handle it on backend)
      setUploadedImages([file]);
      
      // Create preview for UI using FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setUploadedImages([]);
    setImagePreview(null);
    setError('');
  };

  const handleMethodChange = (method) => {
    setUploadMethod(method);
    setUploadedImages([]);
    setImagePreview(null);
    if (method === 'upload') {
      setFormData(prev => ({ ...prev, images: '' }));
    }
    setError('');
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
        images: uploadMethod === 'upload' 
          ? uploadedImages 
          : formData.images.split('\n').map(img => img.trim()).filter(img => img)
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
            <label htmlFor="images">Recipe Images (Optional)</label>
            
            {/* Toggle between Upload and URL */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleMethodChange('upload')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: uploadMethod === 'upload' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: uploadMethod === 'upload' 
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: uploadMethod === 'upload' 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                    : 'none'
                }}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (uploadMethod !== 'upload' && !isSubmitting) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (uploadMethod !== 'upload') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                📤 Upload File
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('url')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: uploadMethod === 'url' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  border: uploadMethod === 'url' 
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: uploadMethod === 'url' 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                    : 'none'
                }}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (uploadMethod !== 'url' && !isSubmitting) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (uploadMethod !== 'url') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                🔗 Image URLs
              </button>
            </div>

            {uploadMethod === 'url' ? (
              // URL Input Method
              <>
                <textarea
                  id="images"
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;..."
                  rows="3"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <small>One URL per line</small>
              </>
            ) : (
              // File Upload Method
              <div style={{ marginTop: '8px' }}>
                {imagePreview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        borderRadius: '12px',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        background: 'rgba(0, 0, 0, 0.3)'
                      }} 
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        fontSize: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="file" 
                      id="edit-recipe-upload-photo" 
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      style={{ display: 'none' }} 
                    />
                    <label 
                      htmlFor="edit-recipe-upload-photo" 
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '2px dashed rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        color: 'rgba(255, 255, 255, 0.7)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '12px', opacity: 0.5 }}>
                        <path d="M12 16V4M12 4l-5 5M12 4l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="3" y="16" width="18" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span style={{ fontSize: '1rem', fontWeight: '600' }}>Click to upload image</span>
                      <span style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.6 }}>Max size: 5MB</span>
                    </label>
                  </>
                )}
              </div>
            )}
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
