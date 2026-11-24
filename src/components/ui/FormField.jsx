import React from 'react';

/**
 * EmlakPro Central FormField Component
 * Ergonomic, lightweight form field layout wrapper. Standardizes label,
 * required indicator, accessibility attributes, error feedback, and helper hints.
 *
 * @param {object} props
 * @param {string} [props.id] - HTML id for label htmlFor and aria association
 * @param {string} [props.label] - Field label text
 * @param {boolean} [props.required=false] - Whether field is required (renders red asterisk)
 * @param {string|null} [props.error] - Validation error message
 * @param {string} [props.hint] - Helpful guidance note beneath field
 * @param {React.ReactNode} props.children - Input / select / textarea / custom element
 * @param {string} [props.className] - Outer wrapper class
 * @param {React.ReactNode} [props.labelRight] - Extra element on label right (e.g. counter, link)
 */
export default function FormField({
  id,
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
  labelRight,
}) {
  const errorId = id ? `${id}-error` : undefined;
  const hintId = id ? `${id}-hint` : undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between mb-0.5">
          {label && (
            <label
              htmlFor={id}
              className="font-label-sm text-body-sm sm:text-label-sm font-semibold text-on-surface block"
            >
              {label}
              {required && (
                <span className="text-error ml-1 font-bold" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {labelRight}
        </div>
      )}

      {/* Form Element (input / select / textarea / custom) */}
      <div className="relative w-full">
        {children}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="font-caption text-caption text-error flex items-center gap-1 mt-0.5 animate-fadeIn"
        >
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      )}

      {/* Helper / Hint Text */}
      {!error && hint && (
        <p
          id={hintId}
          className="font-caption text-caption text-on-surface-variant mt-0.5"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

