"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, setMonth, setYear, getMonth, getYear } from "date-fns";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type ViewMode = "months" | "years";

interface Props {
  id?: string;
  htmlFor?: string;
  label?: string;
  placeholder?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
}

export default function MonthPicker({
  id,
  htmlFor,
  label,
  placeholder = "Chọn tháng",
  value,
  onChange,
  disabled = false,
  error = "",
  required = false,
  className = "",
  minDate,
  maxDate,
  dateFormat = "MM/yyyy",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(value ? getYear(value) : new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("months");
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setViewMode("months");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();

        setPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
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
  }, [isOpen]);

  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const handleMonthClick = (monthIndex: number) => {
    if (isMonthDisabled(monthIndex, currentYear)) return;

    const newDate = setMonth(setYear(new Date(), currentYear), monthIndex);
    if (onChange) {
      onChange(newDate);
    }
    setIsOpen(false);
    setViewMode("months");
  };

  const handlePreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const handlePreviousYearRange = () => {
    setCurrentYear(currentYear - 12);
  };

  const handleNextYearRange = () => {
    setCurrentYear(currentYear + 12);
  };

  const handleYearClick = (year: number) => {
    setCurrentYear(year);
    setViewMode("months");
  };

  const isMonthDisabled = (monthIndex: number, year: number): boolean => {
    setMonth(setYear(new Date(), year), monthIndex);
    if (minDate) {
      const minYear = getYear(minDate);
      const minMonth = getMonth(minDate);
      if (year < minYear || (year === minYear && monthIndex < minMonth)) {
        return true;
      }
    }

    if (maxDate) {
      const maxYear = getYear(maxDate);
      const maxMonth = getMonth(maxDate);
      if (year > maxYear || (year === maxYear && monthIndex > maxMonth)) {
        return true;
      }
    }

    return false;
  };

  const getYearRange = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  return (
    <div className="relative flex flex-col gap-1 w-34" ref={containerRef}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`absolute -top-3 left-5 px-1 bg-white whitespace-nowrap text-sm font-bold transition-all z-10 ${
            disabled
              ? "text-grey-c500 bg-grey-c500"
              : error
              ? "text-support-c900"
              : "text-primary-c700"
          }`}
        >
          {label}
          {required && <span className="text-support-c800"> *</span>}
        </label>
      )}

      <div className="relative" ref={inputRef}>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value ? format(value, dateFormat) : ""}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          readOnly
          disabled={disabled}
          className={`w-full px-5 py-3 pr-12 border-2 rounded-3xl outline-0 text-grey-c700 transition-all ease-linear cursor-pointer ${className}
            ${
              disabled
                ? "bg-grey-c50 cursor-not-allowed"
                : error
                ? "bg-support-c300 border-support-c500 hover:border-support-c700 focus:border-support-c900"
                : "bg-white border-primary-c300 hover:border-primary-c500 focus:border-primary-c700"
            }`}
        />
        <CalendarMonthIcon
          className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
            disabled ? "text-grey-c500" : "text-primary-c700"
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />
      </div>

      {typeof window !== 'undefined' && isOpen && isPositioned && !disabled && createPortal(
        <div
          ref={calendarRef}
          className="fixed bg-white border-2 border-primary-c300 rounded-xl shadow-lg p-4 z-[9999] w-80"
          style={{
            top: `${position.top}px`,
            right: `${position.right}px`,
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={viewMode === "months" ? handlePreviousYear : handlePreviousYearRange}
              className="p-1 hover:bg-primary-c100 rounded-full transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="text-primary-c700" />
            </button>

            <div className="flex gap-2">
              {viewMode === "months" && (
                <button
                  type="button"
                  onClick={() => setViewMode("years")}
                  className="px-3 py-1 text-sm font-bold text-grey-c700 hover:bg-primary-c100 rounded-lg transition-colors cursor-pointer"
                >
                  {currentYear}
                </button>
              )}
              {viewMode === "years" && (
                <span className="px-3 py-1 text-sm font-bold text-grey-c700">
                  {getYearRange()[0]} - {getYearRange()[11]}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={viewMode === "months" ? handleNextYear : handleNextYearRange}
              className="p-1 hover:bg-primary-c100 rounded-full transition-colors cursor-pointer"
            >
              <ChevronRightIcon className="text-primary-c700" />
            </button>
          </div>

          {/* Months View */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => {
                const isCurrentMonth = getMonth(new Date()) === index && getYear(new Date()) === currentYear;
                const isSelectedMonth = value && getMonth(value) === index && getYear(value) === currentYear;
                const isDisabled = isMonthDisabled(index, currentYear);

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleMonthClick(index)}
                    disabled={isDisabled}
                    className={`py-3 text-sm rounded-lg transition-all font-semibold cursor-pointer
                      ${isSelectedMonth ? "bg-primary-c700 text-white" : ""}
                      ${isCurrentMonth && !isSelectedMonth ? "border-2 border-primary-c500" : ""}
                      ${isDisabled ? "text-grey-c300 cursor-not-allowed" : ""}
                      ${!isSelectedMonth && !isDisabled ? "text-grey-c700 hover:bg-primary-c100" : ""}
                    `}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years View */}
          {viewMode === "years" && (
            <div className="grid grid-cols-3 gap-2">
              {getYearRange().map((year) => {
                const isCurrentYear = getYear(new Date()) === year;
                const isSelectedYear = value && getYear(value) === year;

                return (
                  <button
                    type="button"
                    key={year}
                    onClick={() => handleYearClick(year)}
                    className={`py-3 text-sm rounded-lg transition-all font-semibold cursor-pointer
                      ${isSelectedYear ? "bg-primary-c700 text-white" : ""}
                      ${isCurrentYear && !isSelectedYear ? "border-2 border-primary-c500" : ""}
                      ${!isSelectedYear ? "text-grey-c700 hover:bg-primary-c100" : ""}
                    `}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

        </div>,
        document.body
      )}

      {error && <span className="text-sm text-support-c900 ml-5">{error}</span>}
    </div>
  );
}

