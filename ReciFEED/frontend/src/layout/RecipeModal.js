import React from 'react';
import './RecipeModal.css';

const RecipeModal = ({ isOpen, onClose, recipe }) => {
  if (!isOpen || !recipe) return null;

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

        {/* Modal Body */}
        <div className="recipe-modal__body">
          {/* Recipe Image */}
          <div className="recipe-modal__image-container">
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="recipe-modal__image"
            />
          </div>

          {/* Recipe Info */}
          <div className="recipe-modal__info">
            <div className="recipe-modal__info-grid">
              {recipe.cookingTime && (
                <div className="recipe-modal__info-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <span className="recipe-modal__info-label">Cooking Time</span>
                    <span className="recipe-modal__info-value">{recipe.cookingTime}</span>
                  </div>
                </div>
              )}
              {recipe.servings && (
                <div className="recipe-modal__info-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <div>
                    <span className="recipe-modal__info-label">Servings</span>
                    <span className="recipe-modal__info-value">{recipe.servings}</span>
                  </div>
                </div>
              )}
              {recipe.level && (
                <div className="recipe-modal__info-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <span className="recipe-modal__info-label">Difficulty</span>
                    <span className="recipe-modal__info-value">{recipe.level}</span>
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
                <>
                  <li className="recipe-modal__ingredient-item">
                    <span className="recipe-modal__ingredient-bullet">•</span>
                    2 cups all-purpose flour
                  </li>
                  <li className="recipe-modal__ingredient-item">
                    <span className="recipe-modal__ingredient-bullet">•</span>
                    1 cup sugar
                  </li>
                  <li className="recipe-modal__ingredient-item">
                    <span className="recipe-modal__ingredient-bullet">•</span>
                    3 eggs
                  </li>
                  <li className="recipe-modal__ingredient-item">
                    <span className="recipe-modal__ingredient-bullet">•</span>
                    1 tsp vanilla extract
                  </li>
                  <li className="recipe-modal__ingredient-item">
                    <span className="recipe-modal__ingredient-bullet">•</span>
                    1/2 cup butter, melted
                  </li>
                </>
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
                <>
                  <li className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">1</span>
                    <p className="recipe-modal__instruction-text">
                      Preheat your oven to 350°F (175°C) and prepare your baking pan by greasing it lightly.
                    </p>
                  </li>
                  <li className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">2</span>
                    <p className="recipe-modal__instruction-text">
                      In a large mixing bowl, combine the flour and sugar. Mix well to ensure even distribution.
                    </p>
                  </li>
                  <li className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">3</span>
                    <p className="recipe-modal__instruction-text">
                      Add the eggs one at a time, beating well after each addition. Stir in the vanilla extract.
                    </p>
                  </li>
                  <li className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">4</span>
                    <p className="recipe-modal__instruction-text">
                      Pour in the melted butter and mix until the batter is smooth and well combined.
                    </p>
                  </li>
                  <li className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">5</span>
                    <p className="recipe-modal__instruction-text">
                      Transfer the batter to the prepared pan and bake for 25-30 minutes, or until a toothpick inserted in the center comes out clean.
                    </p>
                  </li>
                  <li className="recipe-modal__instruction-item">
                    <span className="recipe-modal__instruction-number">6</span>
                    <p className="recipe-modal__instruction-text">
                      Remove from oven and let cool for 10 minutes before serving. Enjoy your delicious creation!
                    </p>
                  </li>
                </>
              )}
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="recipe-modal__actions">
            <button className="recipe-modal__action-btn recipe-modal__action-btn--save">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Save Recipe
            </button>
            <button className="recipe-modal__action-btn recipe-modal__action-btn--share">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
