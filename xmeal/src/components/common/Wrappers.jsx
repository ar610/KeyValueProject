// src/components/common/Wrappers.jsx

import React from 'react';

/**
 * ScreenWrapper Component
 * A wrapper for full-screen containers, typically used as the outermost element
 * of a view/screen component. Provides consistent padding and centering.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered inside the wrapper.
 * @param {string} [props.className] - Additional Tailwind CSS classes to apply.
 */
export const ScreenWrapper = ({ children, className = '' }) => {
  return (
    <div className={`w-screen min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center ${className}`}>
      {children}
    </div>
  );
};

/**
 * CardWrapper Component
 * A wrapper for content blocks that should appear as distinct cards.
 * Provides consistent background, shadow, border-radius, and padding.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be rendered inside the wrapper.
 * @param {string} [props.className] - Additional Tailwind CSS classes to apply.
 */
export const CardWrapper = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-lg ${className}`}>
      {children}
    </div>
  );
};