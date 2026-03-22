import { forwardRef, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      bordered: 'bg-white border-2 border-gray-300',
      elevated: 'bg-white shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={`rounded-lg p-5 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
