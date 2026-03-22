import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'netflix' | 'prime' | 'hotstar' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export function Badge({ 
  className = '', 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    netflix: 'bg-[#E50914] text-white',
    prime: 'bg-[#00A8E1] text-white',
    hotstar: 'bg-[#D4AF37] text-gray-900',
    success: 'bg-[#10B981] text-white',
    warning: 'bg-[#F59E0B] text-white',
    error: 'bg-[#EF4444] text-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
