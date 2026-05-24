export default function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-primary-200 border-t-primary-600`}
      />
      {text && (
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}
