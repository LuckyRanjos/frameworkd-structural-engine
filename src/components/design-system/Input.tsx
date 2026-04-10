import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
}

/**
 * Input Component
 * Accessible form input with optional label, error, and hint text
 * 
 * Usage:
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="your@email.com"
 *   error="Invalid email format"
 * />
 * 
 * <Input
 *   label="Search"
 *   icon="🔍"
 *   iconPosition="left"
 * />
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  rightIcon,
  onRightIconClick,
  fullWidth = true,
  variant = 'default',
  className = '',
  disabled = false,
  ...inputProps
}) => {
  const inputId = inputProps.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const variantClasses = variant === 'filled'
    ? 'bg-neutral-100 border-neutral-300'
    : 'bg-white border-neutral-300';

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {inputProps.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none flex items-center justify-center w-5 h-5">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-2xl border-2 transition-all duration-200 ${variantClasses} ${
            icon && iconPosition === 'left' ? 'pl-10' : ''
          } ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${
            rightIcon ? 'pr-10' : ''
          } ${
            error ? 'border-red-500 ring-2 ring-red-200' : 'border-neutral-300 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-100'
          } ${disabled ? 'bg-neutral-100 cursor-not-allowed' : ''} ${className}`}
          {...inputProps}
        />

        {icon && iconPosition === 'right' && !onRightIconClick && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 pointer-events-none flex items-center justify-center w-5 h-5">
            {icon}
          </div>
        )}

        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-foreground transition-colors flex items-center justify-center w-5 h-5"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}

      {hint && !error && (
        <p className="text-sm text-neutral-500">{hint}</p>
      )}
    </div>
  );
};

export default Input;
