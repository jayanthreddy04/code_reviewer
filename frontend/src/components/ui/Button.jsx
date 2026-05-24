import clsx from 'clsx';

export default function Button({
  children,
  variant = 'primary',
  className,
  loading,
  disabled,
  ...props
}) {
  return (
    <button
      className={clsx(
        variant === 'primary' ? 'btn-primary' : 'btn-secondary',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
