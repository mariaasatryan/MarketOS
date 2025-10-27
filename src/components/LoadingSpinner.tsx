
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-label="Загрузка">
      <div 
        className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && (
        <p className="mt-2 text-slate-600 text-sm" aria-live="polite">
          {text}
        </p>
      )}
      <span className="sr-only">Загрузка...</span>
    </div>
  );
}
