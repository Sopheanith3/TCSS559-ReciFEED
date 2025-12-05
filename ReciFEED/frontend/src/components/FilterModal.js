import React, { useState, useEffect } from 'react';
import '../styles/layout/FilterModal.css';

const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters, availableTags, availableCookingTimes }) => {
  const [selectedTags, setSelectedTags] = useState(currentFilters.tags || []);
  const [selectedCookingTime, setSelectedCookingTime] = useState(currentFilters.cookingTime || '');

  useEffect(() => {
    if (isOpen) {
      setSelectedTags(currentFilters.tags || []);
      setSelectedCookingTime(currentFilters.cookingTime || '');
    }
  }, [isOpen, currentFilters]);

  if (!isOpen) return null;

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCookingTimeChange = (time) => {
    setSelectedCookingTime(time === selectedCookingTime ? '' : time);
  };

  const handleApply = () => {
    onApplyFilters({
      tags: selectedTags,
      cookingTime: selectedCookingTime
    });
    onClose();
  };

  const handleClear = () => {
    setSelectedTags([]);
    setSelectedCookingTime('');
    onApplyFilters({
      tags: [],
      cookingTime: ''
    });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="filter-modal-overlay" onClick={handleBackdropClick}>
      <div className="filter-modal">
        <div className="filter-modal__header">
          <h2>Filter Recipes</h2>
          <button className="filter-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="filter-modal__body">
          {/* Tags Filter */}
          <div className="filter-modal__section">
            <h3 className="filter-modal__section-title">Tags</h3>
            <div className="filter-modal__tags">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <button
                    key={tag}
                    className={`filter-modal__tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <p className="filter-modal__empty">No tags available</p>
              )}
            </div>
          </div>

          {/* Cooking Time Filter */}
          <div className="filter-modal__section">
            <h3 className="filter-modal__section-title">Cooking Time</h3>
            <div className="filter-modal__cooking-times">
              {availableCookingTimes.length > 0 ? (
                availableCookingTimes.map((time) => (
                  <button
                    key={time}
                    className={`filter-modal__time-btn ${selectedCookingTime === time ? 'active' : ''}`}
                    onClick={() => handleCookingTimeChange(time)}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p className="filter-modal__empty">No cooking times available</p>
              )}
            </div>
          </div>
        </div>

        <div className="filter-modal__footer">
          <button className="filter-modal__clear-btn" onClick={handleClear}>
            Clear All
          </button>
          <button className="filter-modal__apply-btn" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
