// Loader Component
// This component shows a loading spinner when data is being fetched

'use client';

export default function Loader({ size = 'default', text = 'Loading...' }) {
  // Set classes based on size
  const sizeClasses = {
    small: 'size-6 border-2',
    default: 'size-10 border-3',
    large: 'size-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {/* Spinning circle */}
      <div
        className={`${sizeClasses[size] || sizeClasses.default} rounded-full border-slate-200 dark:border-slate-700 border-t-primary animate-spin`}
      />
      {/* Loading text */}
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>
      )}
    </div>
  );
}
