"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, setMonth, setYear, getMonth, getYear, isBefore, isAfter, isSameMonth } from "date-fns";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {DateRange} from "@/types/interface";

type ViewMode = "months" | "years";
type SelectionState = "start" | "end";



interface Props {
  id?: string;
  htmlFor?: string;
  label?: string;
  placeholder?: string;
  value?: DateRange | null;
  onChange?: (dateRange: DateRange | null) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: string;
  maxRange?: number; // Maximum number of months that can be selected
}

export default function MonthRangePicker({
  id,
  htmlFor,
  label,
  placeholder = "Chọn khoảng tháng",
  value = { start: null, end: null },
  onChange,
  disabled = false,
  error = "",
  required = false,
  className = "",
  minDate,
  maxDate,
  dateFormat = "MM/yyyy",
  maxRange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(
    value?.start ? getYear(value.start) : new Date().getFullYear()
  );
  const [viewMode, setViewMode] = useState<ViewMode>("months");
  const [selectionState, setSelectionState] = useState<SelectionState>("start");
  const [tempRange, setTempRange] = useState<DateRange>(value || { start: null, end: null });
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
        setSelectionState("start");
        setTempRange(value || { start: null, end: null });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

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

  const getMonthsDifference = (date1: Date, date2: Date): number => {
    const year1 = getYear(date1);
    const month1 = getMonth(date1);
    const year2 = getYear(date2);
    const month2 = getMonth(date2);

    return Math.abs((year2 - year1) * 12 + (month2 - month1)) + 1;
  };

  const handleMonthClick = (monthIndex: number) => {
    if (isMonthDisabled(monthIndex, currentYear)) return;

    const selectedDate = setMonth(setYear(new Date(), currentYear), monthIndex);

    if (selectionState === "start") {
      setTempRange({ start: selectedDate, end: null });
      setSelectionState("end");
    } else {
      // If selecting end date
      if (tempRange.start && isBefore(selectedDate, tempRange.start)) {
        // If end date is before start date, swap them
        setTempRange({ start: selectedDate, end: tempRange.start });
      } else {
        setTempRange({ ...tempRange, end: selectedDate });
      }

      // Apply the selection
      const finalRange = tempRange.start && isBefore(selectedDate, tempRange.start)
        ? { start: selectedDate, end: tempRange.start }
        : { start: tempRange.start, end: selectedDate };

      if (onChange) {
        onChange(finalRange);
      }

      setIsOpen(false);
      setViewMode("months");
      setSelectionState("start");
    }
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
    const checkDate = setMonth(setYear(new Date(), year), monthIndex);

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

    // Check maxRange when selecting end date
    if (maxRange && selectionState === "end" && tempRange.start) {
      const monthsDiff = getMonthsDifference(tempRange.start, checkDate);
      if (monthsDiff > maxRange) {
        return true;
      }
    }

    return false;
  };

  const isMonthInRange = (monthIndex: number, year: number): boolean => {
    const checkDate = setMonth(setYear(new Date(), year), monthIndex);

    if (tempRange.start && tempRange.end) {
      return (
        (isAfter(checkDate, tempRange.start) || isSameMonth(checkDate, tempRange.start)) &&
        (isBefore(checkDate, tempRange.end) || isSameMonth(checkDate, tempRange.end))
      );
    }

    return false;
  };

  const isStartMonth = (monthIndex: number, year: number): boolean => {
    if (!tempRange.start) return false;
    return getMonth(tempRange.start) === monthIndex && getYear(tempRange.start) === year;
  };

  const isEndMonth = (monthIndex: number, year: number): boolean => {
    if (!tempRange.end) return false;
    return getMonth(tempRange.end) === monthIndex && getYear(tempRange.end) === year;
  };

  const getYearRange = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  const formatDateRange = (): string => {
    if (!value?.start && !value?.end) return "";
    if (value?.start && !value?.end) return format(value.start, dateFormat);
    if (!value?.start && value?.end) return format(value.end, dateFormat);
    return `${format(value.start!, dateFormat)} - ${format(value.end!, dateFormat)}`;
  };


  return (
    <div className="relative flex flex-col gap-1 w-56" ref={containerRef}>
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
          value={formatDateRange()}
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

          {/* Selection State Indicator */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="text-xs text-grey-c600">
              {selectionState === "start" ? "Chọn tháng bắt đầu" : "Chọn tháng kết thúc"}
            </div>
          </div>

          {/* Months View */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => {
                const isCurrentMonth = getMonth(new Date()) === index && getYear(new Date()) === currentYear;
                const isStart = isStartMonth(index, currentYear);
                const isEnd = isEndMonth(index, currentYear);
                const isInRange = isMonthInRange(index, currentYear);
                const isDisabled = isMonthDisabled(index, currentYear);

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleMonthClick(index)}
                    disabled={isDisabled}
                    className={`py-3 text-sm rounded-lg transition-all font-semibold cursor-pointer
                      ${isStart || isEnd ? "bg-primary-c700 text-white" : ""}
                      ${isInRange && !isStart && !isEnd ? "bg-primary-c200 text-grey-c700" : ""}
                      ${isCurrentMonth && !isStart && !isEnd && !isInRange ? "border-2 border-primary-c500" : ""}
                      ${isDisabled ? "text-grey-c300 cursor-not-allowed" : ""}
                      ${!isStart && !isEnd && !isInRange && !isDisabled ? "text-grey-c700 hover:bg-primary-c100" : ""}
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
                const isSelectedYear =
                  (tempRange.start && getYear(tempRange.start) === year) ||
                  (tempRange.end && getYear(tempRange.end) === year);

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

