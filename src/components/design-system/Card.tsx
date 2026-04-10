import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'filled';
  onClick?: () => void;
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const variantMap = {
  default: 'bg-white border border-neutral-200',
  elevated: 'bg-white border border-neutral-200 shadow-lg',
  filled: 'bg-neutral-50 border border-neutral-200',
};

/**
 * Card Component
 * Reusable container with soft shadows, rounded corners, and generous whitespace
 * 
 * Usage:
 * <Card padding="md" variant="default">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  padding = 'md',
  variant = 'default',
  onClick,
}) => {
  const baseClasses = `rounded-3xl transition-all duration-200 ${paddingMap[padding]} ${variantMap[variant]}`;
  const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-md hover:border-amber-300' : '';

  return (
    <div
      className={`card ${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;
