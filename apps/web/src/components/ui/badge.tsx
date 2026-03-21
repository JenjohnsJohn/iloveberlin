interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-orange-100 text-orange-700',
  secondary: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
