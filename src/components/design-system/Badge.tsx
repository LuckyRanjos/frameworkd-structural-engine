import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantMap = {
  primary: 'bg-amber-100 text-amber-900 border border-amber-300',
  success: 'bg-green-100 text-green-700 border border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  error: 'bg-red-100 text-red-700 border border-red-300',
  info: 'bg-blue-100 text-blue-700 border border-blue-300',
  neutral: 'bg-neutral-200 text-neutral-700 border border-neutral-300',
};

const sizeMap = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

/**
 * Badge Component
 * Small label/tag for categorization or status indication
 * 
 * Usage:
 * <Badge variant="success">Active</Badge>
 * 
 * <Badge variant="error" dismissible onDismiss={handleClose}>
 *   Error Alert
 * </Badge>
 * 
 * <Badge variant="primary" icon="⭐" size="lg">
 *   Premium
 * </Badge>
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const baseClasses = `inline-flex items-center gap-1.5 font-semibold rounded-full transition-colors duration-200 ${sizeMap[size]} ${variantMap[variant]}`;

  return (
    <span className={`${baseClasses} ${className}`}>
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 hover:opacity-70 transition-opacity font-bold"
          aria-label="Dismiss badge"
        >
          ✕
        </button>
      )}
    </span>
  );
};

export default Badge;
