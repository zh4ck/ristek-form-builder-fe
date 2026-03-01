import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        // Generate a default ID if none is provided to link label & input for accessibility
        const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

        return (
            <div className="w-full flex flex-col gap-1.5">
                <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>

                <input
                    id={inputId}
                    ref={ref}
                    className={`
            w-full rounded-md border text-gray-900 bg-white px-3 py-2 text-sm 
            transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 
            disabled:cursor-not-allowed disabled:opacity-50
            ${error
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : 'border-gray-300 focus-visible:ring-indigo-500'
                        }
            ${className}
          `}
                    {...props}
                />

                {error && (
                    <p className="text-sm text-red-500 mt-1" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
