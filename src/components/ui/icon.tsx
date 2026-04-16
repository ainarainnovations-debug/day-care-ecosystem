import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'muted' | 'success' | 'warning' | 'danger';
export type IconStyle = 'default' | 'advanced' | 'bold';

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  strokeWidth?: number;
  background?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  iconStyle?: IconStyle;
}

const sizeMap: Record<IconSize, { size: number; strokeWidth: number }> = {
  xs: { size: 12, strokeWidth: 2.25 },
  sm: { size: 16, strokeWidth: 2.25 },
  md: { size: 20, strokeWidth: 2.25 },
  lg: { size: 24, strokeWidth: 2.25 },
  xl: { size: 32, strokeWidth: 2 },
  '2xl': { size: 48, strokeWidth: 1.75 },
};

const variantMap: Record<IconVariant, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  accent: 'text-accent',
  muted: 'text-muted-foreground',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-destructive',
};

const backgroundMap: Record<IconVariant, string> = {
  default: 'bg-secondary/60 text-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent/10 text-accent',
  muted: 'bg-muted text-muted-foreground',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  danger: 'bg-destructive/10 text-destructive',
};

const roundedMap: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const iconStyleMap: Record<IconStyle, string> = {
  default: '',
  advanced: 'icon-advanced',
  bold: 'icon-advanced-bold',
};

export const Icon: React.FC<IconProps> = ({
  icon: LucideIconComponent,
  size = 'md',
  variant = 'default',
  className,
  strokeWidth,
  background = false,
  rounded = 'full',
  iconStyle = 'default',
}) => {
  const { size: iconSize, strokeWidth: defaultStrokeWidth } = sizeMap[size];
  const variantClass = background ? backgroundMap[variant] : variantMap[variant];
  const roundedClass = background ? roundedMap[rounded] : '';
  const styleClass = iconStyleMap[iconStyle];

  const paddingMap: Record<IconSize, string> = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
    '2xl': 'p-4',
  };

  if (background) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center flex-shrink-0 transition-colors',
          variantClass,
          roundedClass,
          paddingMap[size],
          styleClass,
          className
        )}
      >
        <LucideIconComponent
          size={iconSize}
          strokeWidth={strokeWidth || defaultStrokeWidth}
        />
      </div>
    );
  }

  return (
    <span className={cn('inline-flex', styleClass)}>
      <LucideIconComponent
        size={iconSize}
        strokeWidth={strokeWidth || defaultStrokeWidth}
        className={cn(variantClass, 'flex-shrink-0', className)}
      />
    </span>
  );
};

// Preset icon components for common use cases
export const IconButton: React.FC<IconProps & { onClick?: () => void }> = ({
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center',
        'hover:bg-accent/10 active:bg-accent/20',
        'transition-colors duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        roundedMap[props.rounded || 'full'],
        props.background ? '' : 'p-2'
      )}
      type="button"
    >
      <Icon {...props} />
    </button>
  );
};

// Badge icon with background
export const IconBadge: React.FC<IconProps> = (props) => {
  return <Icon {...props} background={true} />;
};

// Export common sizes as constants
export const ICON_SIZES = {
  XS: 'xs' as const,
  SM: 'sm' as const,
  MD: 'md' as const,
  LG: 'lg' as const,
  XL: 'xl' as const,
  XXL: '2xl' as const,
};

// Export common variants as constants
export const ICON_VARIANTS = {
  DEFAULT: 'default' as const,
  PRIMARY: 'primary' as const,
  SECONDARY: 'secondary' as const,
  ACCENT: 'accent' as const,
  MUTED: 'muted' as const,
  SUCCESS: 'success' as const,
  WARNING: 'warning' as const,
  DANGER: 'danger' as const,
};
