'use client';

import {useState, useRef, useEffect, ReactNode} from 'react';
import Animation from './Animation';

interface MenuItem {
  id: string | number;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
}

interface Props {
  label?: string;
  trigger: ReactNode;
  items: MenuItem[];
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
}

export default function DropdownMenu(
  {
    label,
    trigger,
    items,
    className = "",
    menuClassName = "",
    disabled = false,
    align = 'right',
  }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={toggleDropdown}
        className={`cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {trigger}
      </div>

      {/* Dropdown Menu with Animation */}
      {!disabled &&
      <Animation
        isOpen={isOpen}
        className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'}`}
      >
        <div
          className={`bg-white border-2 border-primary-c500 rounded-2xl shadow-lg z-50 min-w-48 overflow-hidden ${menuClassName}`}
        >
          {label && (
            <div className="px-3 py-2 border-b border-grey-c200 text-lg font-semibold text-grey-c700">
              {label}
            </div>
          )}
          {items.map((item) => (
            <div key={item.id}>
              {item.divider ? (
                <div className="border-t border-grey-c200 my-1" />
              ) : (
                <div
                  onClick={() => handleItemClick(item)}
                  className="px-6 py-3 cursor-pointer transition-all hover:bg-primary-c100 flex items-center gap-3 text-grey-c700 hover:text-primary-c900"
                >
                  {item.icon && <span className="flex items-center">{item.icon}</span>}
                  <span className={"text-nowrap"}>{item.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Animation>
      }
    </div>
  );
}
