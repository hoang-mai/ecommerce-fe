'use client';

import {useState, useRef, useEffect} from 'react';
import {createPortal} from 'react-dom';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface Props {
  id?: string;
  htmlFor?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  options: Option[];
  align?: "top" | "bottom";
  enableSearch?: boolean;
  searchPlaceholder?: string;
}

export default function DropdownSelect(
  {
    id,
    htmlFor,
    label,
    placeholder = "Chọn một tùy chọn",
    value,
    onChange,
    disabled = false,
    error = "",
    required = false,
    className = "",
    options,
    align = "bottom",
    enableSearch = false,
    searchPlaceholder = "Tìm kiếm...",
  }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0});
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Filter options based on search term
  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input when dropdown opens
      if (enableSearch && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, enableSearch]);

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();

        setPosition({
          top: align === "top" ? rect.top - 8 : rect.bottom + 8,
          left: rect.left,
        });
        setIsPositioned(true);
      }
    };

    if (isOpen) {
      let rafId: number;

      requestAnimationFrame(() => {
        setIsPositioned(false);
        updatePosition();

        const smoothUpdate = () => {
          updatePosition();
          rafId = requestAnimationFrame(smoothUpdate);
        };

        rafId = requestAnimationFrame(smoothUpdate);
      });

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        setIsPositioned(false);
      };
    }
  }, [isOpen, align]);

  const handleSelect = (optionId: string | number) => {
    if (onChange) {
      onChange(String(optionId));
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={dropdownRef}>
      {label &&
          <label htmlFor={htmlFor}
                 className={`absolute z-label -top-3 left-5 bg-white whitespace-nowrap text-sm font-bold transition-all  px-1 ${disabled ? "text-grey-c500" : error ? "text-support-c900" : "text-primary-c700"}`}>
            {label}{required && <span className="text-support-c800"> *</span>}
          </label>
      }

      {/* Dropdown Button */}
      <div ref={inputRef}>
        <div
          id={id}
          onClick={toggleDropdown}
          className={`${className} w-full px-5 py-3 border-2 rounded-3xl outline-0 transition-all ease-linear flex items-center justify-between cursor-pointer
            ${disabled ? "bg-grey-c50 cursor-not-allowed" : error ? "bg-support-c300 border-support-c500 hover:border-support-c700" : isOpen ? "bg-white border-primary-c700" : "bg-white border-primary-c300 hover:border-primary-c500"}`}
        >
          <span className={`${!selectedOption ? "text-grey-c400" : "text-grey-c700"}`}>
            {displayValue}
          </span>
          <KeyboardArrowDownRoundedIcon
            className={`text-grey-c600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Dropdown Menu with Portal */}
      {typeof window !== 'undefined' && isOpen && isPositioned && !disabled && createPortal(
        <div
          ref={menuRef}
          className={`fixed bg-white border-2 border-primary-c500 rounded-2xl shadow-lg z-dropdown w-fit ${
            align === "top" ? "origin-bottom" : "origin-top"
          }`}
          style={{
            top: align === "top" ? 'auto' : `${position.top}px`,
            bottom: align === "top" ? `${window.innerHeight - position.top}px` : 'auto',
            left: `${position.left}px`,

          }}
        >
          {/* Search Input */}
          {enableSearch && (
            <div className="p-3">
              <div className="relative">
                <SearchRoundedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-c500" style={{fontSize: 20}} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-3 py-2 bg-white border-2 border-primary-c300 hover:border-primary-c500 focus:border-primary-c700 rounded-lg outline-none transition-all text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`px-5 py-3 cursor-pointer transition-all hover:bg-primary-c100 first:rounded-t-2xl last:rounded-b-2xl
                    ${value === option.id ? "bg-primary-c200 text-primary-c900 font-semibold" : "text-grey-c700"}`}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-5 py-3 text-grey-c500 text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {error && <span className="text-sm text-support-c900 ml-5">{error}</span>}
    </div>
  );
}
