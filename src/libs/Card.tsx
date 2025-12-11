import React from 'react';
import Chip, {ChipColor, ChipVariant} from '@/libs/Chip';
import NorthRoundedIcon from '@mui/icons-material/NorthRounded';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';
import MonthPicker from '@/libs/MonthPicker';
export enum CardPadding {
  NONE = 'none',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

interface CardProps {
  children?: React.ReactNode;
  baseClasses?: string;
  padding?: CardPadding;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  actions?: React.ReactNode;
  monthDate?: Date | null;
  onChangeMonthDate?: (date: Date | null) => void;
  isStats?: boolean;
  value?: string | number;
  growth?: number;
  growthLabel?: string;
}

const paddingClasses: Record<CardPadding, string> = {
  [CardPadding.NONE]: 'p-0',
  [CardPadding.SMALL]: 'p-3',
  [CardPadding.MEDIUM]: 'p-4 md:p-6',
  [CardPadding.LARGE]: 'p-6 md:p-8',
};


export default function Card({
                               children,
                               padding = CardPadding.MEDIUM,
                               className = '',
                               baseClasses = 'bg-white rounded-2xl shadow-sm border border-grey-c200',
                               onClick,
                               hover = false,
                               header,
                               footer,
                               title,
                               subtitle,
                               icon,
                               iconBg = 'bg-primary-c100',
                               iconColor = 'text-primary-c700',
                               actions,
                               isStats = false,
                               monthDate,
                               onChangeMonthDate,
                               value,
                               growth,
                             }: CardProps) {

  const paddingClass = paddingClasses[padding];
  const hoverClasses = hover || onClick ? 'transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  if (isStats) {
    return (
      <div
        className={`${baseClasses} ${paddingClass} ${hoverClasses} ${clickableClasses} ${className}`}
        onClick={onClick}
      >

          <div className="flex flex-row gap-2">

            <div className="flex-1 ">
              {icon && (
                <div className={`${iconBg} ${iconColor} w-fit h-fit p-3 md:p-4 rounded-xl flex-shrink-0`}>
                  {icon}
                </div>
              )}
              <p className="text-grey-c500 text-sm font-medium">{title}</p>
              <h3 className="text-primary-c900 text-lg font-bold">
                {value}
              </h3>
              {subtitle && (
                <p className="text-xs text-grey-c500 mb-2">{subtitle}</p>
              )}


            </div>
            <div className={"flex flex-col justify-between items-end"}>{monthDate && (
              <MonthPicker
                label={"Tháng"}
                value={monthDate}
                onChange={onChangeMonthDate}
              />
            )}
              {growth !== undefined && (
                <Chip
                  icon={growth >= 0 ? <NorthRoundedIcon className={"!w-3.5 !h-3.5"}/> :
                    <SouthRoundedIcon className={"!w-3.5 !h-3.5"}/>}
                  label={`${Math.abs(growth).toFixed(1)}%`}
                  variant={ChipVariant.SOFT}
                  color={growth >= 0 ? ChipColor.SUCCESS : ChipColor.ERROR}
                />
              )}</div>
          </div>

      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${paddingClass} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {/* Header Section */}
      {header && <div className="mb-4">{header}</div>}

      {/* Title Section with Icon */}
      {(title || icon) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            {icon && (
              <div className={`${iconBg} ${iconColor} p-3 rounded-xl flex-shrink-0`}>
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-grey-c900 truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-grey-c600 mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
        </div>
      )}

      {/* Main Content */}
      {children && <div>{children}</div>}

      {/* Footer Section */}
      {footer && <div className="mt-4 pt-4 border-t border-grey-c200">{footer}</div>}
    </div>
  );
}

