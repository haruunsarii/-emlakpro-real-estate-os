import React from 'react';

/**
 * Base Skeleton Atom Component
 * Provides smooth pulse animations matching EmlakPro's color system
 * with zero layout shift and accessible aria-busy indicators.
 */
export default function Skeleton({
  className = '',
  style = {},
  animate = true,
  children,
}) {
  return (
    <div
      className={`bg-surface-container-high/60 ${
        animate ? 'animate-pulse' : ''
      } rounded-lg ${className}`}
      style={style}
      aria-busy="true"
      role="status"
    >
      {children}
    </div>
  );
}

