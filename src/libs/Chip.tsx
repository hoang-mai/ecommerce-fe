'use client';

import { ReactNode } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export enum ChipVariant {
  FILLED = 'filled',
  OUTLINED = 'outlined',
  SOFT = 'soft',
}

export enum ChipColor {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum ChipSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: ChipSize;
  icon?: ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Chip({
  label,
  variant = ChipVariant.FILLED,
  color = ChipColor.PRIMARY,
  size = ChipSize.MEDIUM,
  icon,
  onDelete,
  onClick,
  className = '',
  disabled = false,
}: ChipProps) {
  const getColorClasses = () => {
    const colorMap = {
      [ChipVariant.FILLED]: {
        [ChipColor.PRIMARY]: 'bg-primary-c700 text-white hover:bg-primary-c800',
        [ChipColor.SECONDARY]: 'bg-grey-c600 text-white hover:bg-grey-c700',
        [ChipColor.SUCCESS]: 'bg-success-c600 text-white hover:bg-success-c700',
        [ChipColor.ERROR]: 'bg-support-c600 text-white hover:bg-support-c700',
        [ChipColor.WARNING]: 'bg-yellow-c600 text-white hover:bg-yellow-c700',
        [ChipColor.INFO]: 'bg-primary-c500 text-white hover:bg-primary-c600',
      },
      [ChipVariant.OUTLINED]: {
        [ChipColor.PRIMARY]: 'border-2 border-primary-c700 text-primary-c700 hover:bg-primary-c50',
        [ChipColor.SECONDARY]: 'border-2 border-grey-c600 text-grey-c600 hover:bg-grey-c50',
        [ChipColor.SUCCESS]: 'border-2 border-success-c600 text-success-c600 hover:bg-success-c50',
        [ChipColor.ERROR]: 'border-2 border-support-c600 text-support-c600 hover:bg-support-c50',
        [ChipColor.WARNING]: 'border-2 border-yellow-c600 text-yellow-c600 hover:bg-yellow-c50',
        [ChipColor.INFO]: 'border-2 border-primary-c500 text-primary-c500 hover:bg-primary-c50',
      },
      [ChipVariant.SOFT]: {
        [ChipColor.PRIMARY]: 'bg-primary-c100 text-primary-c900 hover:bg-primary-c200',
        [ChipColor.SECONDARY]: 'bg-grey-c100 text-grey-c900 hover:bg-grey-c200',
        [ChipColor.SUCCESS]: 'bg-success-c100 text-success-c900 hover:bg-success-c200 ',
        [ChipColor.ERROR]: 'bg-support-c400 text-support-c900 hover:bg-support-c500',
        [ChipColor.WARNING]: 'bg-yellow-c100 text-yellow-c900 hover:bg-yellow-c300',
        [ChipColor.INFO]: 'bg-primary-c100 text-primary-c700 hover:bg-primary-c200',
      },
    };

    return colorMap[variant][color];
  };

  const getSizeClasses = () => {
    const sizeMap = {
      [ChipSize.SMALL]: 'px-2 py-1.5 text-xs gap-1',
      [ChipSize.MEDIUM]: 'px-3 py-1.5 text-xs gap-1.5',
      [ChipSize.LARGE]: 'px-4 py-2 text-sm gap-2',
    };

    return sizeMap[size];
  };

  const getIconSize = () => {
    const iconSizeMap = {
      [ChipSize.SMALL]: 'text-sm',
      [ChipSize.MEDIUM]: 'text-base',
      [ChipSize.LARGE]: 'text-lg',
    };

    return iconSizeMap[size];
  };

  const baseClasses = 'inline-flex items-center rounded-full transition-all duration-200 font-bold ';
  const interactiveClasses = onClick && !disabled ? 'cursor-pointer hover:scale-105 hover:shadow-md' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${getColorClasses()}
        ${getSizeClasses()}
        ${interactiveClasses}
        ${disabledClasses}
        ${className}
      `}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {icon && (
        <span className={`${getIconSize()} flex items-center`}>
          {icon}
        </span>
      )}

      <span className="truncate">{label}</span>

      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={disabled}
          className={`
            ${getIconSize()}
            flex items-center justify-center
            rounded-full
            transition-all duration-200
            hover:scale-110
            ${!disabled ? 'hover:bg-black/10' : ''}
          `}
          aria-label="Remove"
          type="button"
        >
          <CloseRoundedIcon fontSize="inherit" />
        </button>
      )}
    </div>
  );
}

