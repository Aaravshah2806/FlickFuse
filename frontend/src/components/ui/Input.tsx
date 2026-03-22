import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full border rounded-md px-4 py-3 text-base
            focus:outline-none focus:ring-2 transition-all duration-200
            placeholder:text-gray-400
            ${error 
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/10' 
              : 'border-gray-300 focus:border-[#2563EB] focus:ring-[#2563EB]/10'
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#EF4444]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
