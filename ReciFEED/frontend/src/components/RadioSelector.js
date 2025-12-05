import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/RadioSelector.css';

const RadioSelector = ({ selected, setSelected, options }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef(null);
  const buttonRefs = useRef({});

  useEffect(() => {
    updateIndicator();
  }, [selected]);

  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selected]);

  const updateIndicator = () => {
    const button = buttonRefs.current[selected];
    if (button && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      setIndicatorStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left,
      });
    }
  };

  const handleSelect = (value) => {
    setSelected(value);
  };

  return (
    <div className="radio-selector" ref={containerRef}>
      <div
        className="radio-selector__indicator"
        style={{
          width: `${indicatorStyle.width}px`,
          left: `${indicatorStyle.left}px`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => (buttonRefs.current[option.value] = el)}
          onClick={() => handleSelect(option.value)}
          className={`radio-selector__button ${
            selected === option 
              ? 'radio-selector__button--active' 
              : 'radio-selector__button--inactive'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default RadioSelector;