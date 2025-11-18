"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, setMonth, setYear, getMonth, getYear, addYears, subYears } from "date-fns";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

type ViewMode = "days" | "months" | "years";

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

export default function DatePicker({
  id,
  htmlFor,
  label,
  placeholder = "Chọn ngày",
  value,
  onChange,
  disabled = false,
  error = "",
  required = false,
  className = "",
  minDate,
  maxDate,
  dateFormat = "dd/MM/yyyy",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("days");
  const [position, setPosition] = useState({ top: 0, left: 0 });
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
        setViewMode("days");
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
          left: rect.left,
        });
        setIsPositioned(true);
      }
    };

    if (isOpen) {
      // Sử dụng requestAnimationFrame để cập nhật mượt mà hơn
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

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];


  const handleDateClick = (day: Date) => {
    if (isDateDisabled(day)) return;
    if (onChange) {
      onChange(day);
    }
    setIsOpen(false);
    setViewMode("days");
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousYear = () => {
    setCurrentMonth(subYears(currentMonth, 1));
  };

  const handleNextYear = () => {
    setCurrentMonth(addYears(currentMonth, 1));
  };

  const handlePreviousYearRange = () => {
    setCurrentMonth(subYears(currentMonth, 12));
  };

  const handleNextYearRange = () => {
    setCurrentMonth(addYears(currentMonth, 12));
  };

  const handleMonthClick = (monthIndex: number) => {
    setCurrentMonth(setMonth(currentMonth, monthIndex));
    setViewMode("days");
  };

  const handleYearClick = (year: number) => {
    setCurrentMonth(setYear(currentMonth, year));
    setViewMode("months");
  };

  const isDateDisabled = (day: Date): boolean => {
    if (minDate && day < minDate) return true;
    return !!(maxDate && day > maxDate);
  };

  const getYearRange = () => {
    const year = getYear(currentMonth);
    const startYear = Math.floor(year / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={containerRef}>
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
          className={`${className} w-full px-5 py-3 pr-12 border-2 rounded-3xl outline-0 text-grey-c700 transition-all ease-linear cursor-pointer
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
            left: `${position.left}px`,
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={viewMode === "days" ? handlePreviousMonth : viewMode === "months" ? handlePreviousYear : handlePreviousYearRange}
              className="p-1 hover:bg-primary-c100 rounded-full transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="text-primary-c700" />
            </button>

            <div className="flex gap-2">
              {viewMode === "days" && (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode("months")}
                    className="px-3 py-1 text-sm font-bold text-grey-c700 hover:bg-primary-c100 rounded-lg transition-colors cursor-pointer"
                  >
                    {months[getMonth(currentMonth)]}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("years")}
                    className="px-3 py-1 text-sm font-bold text-grey-c700 hover:bg-primary-c100 rounded-lg transition-colors cursor-pointer"
                  >
                    {getYear(currentMonth)}
                  </button>
                </>
              )}
              {viewMode === "months" && (
                <button
                  type="button"
                  onClick={() => setViewMode("years")}
                  className="px-3 py-1 text-sm font-bold text-grey-c700 hover:bg-primary-c100 rounded-lg transition-colors cursor-pointer"
                >
                  {getYear(currentMonth)}
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
              onClick={viewMode === "days" ? handleNextMonth : viewMode === "months" ? handleNextYear : handleNextYearRange}
              className="p-1 hover:bg-primary-c100 rounded-full transition-colors cursor-pointer"
            >
              <ChevronRightIcon className="text-primary-c700" />
            </button>
          </div>

          {/* Days View */}
          {viewMode === "days" && (
            <>
              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-grey-c500 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {daysInMonth.map((day) => {
                  const isSelected = value && isSameDay(day, value);
                  const isCurrentDay = isToday(day);
                  const isDisabled = isDateDisabled(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      type="button"
                      key={day.toString()}
                      onClick={() => handleDateClick(day)}
                      disabled={isDisabled || !isCurrentMonth}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer
                        ${isSelected ? "bg-primary-c700 text-white font-bold" : ""}
                        ${isCurrentDay && !isSelected ? "border-2 border-primary-c500 font-semibold" : ""}
                        ${isDisabled || !isCurrentMonth ? "text-grey-c300 cursor-not-allowed" : "text-grey-c700 hover:bg-primary-c100"}
                        ${!isSelected && !isDisabled && isCurrentMonth ? "hover:bg-primary-c100" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Months View */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => {
                const isCurrentMonth = getMonth(new Date()) === index && getYear(new Date()) === getYear(currentMonth);
                const isSelectedMonth = value && getMonth(value) === index && getYear(value) === getYear(currentMonth);

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleMonthClick(index)}
                    className={`py-3 text-sm rounded-lg transition-all font-semibold cursor-pointer
                      ${isSelectedMonth ? "bg-primary-c700 text-white" : ""}
                      ${isCurrentMonth && !isSelectedMonth ? "border-2 border-primary-c500" : ""}
                      ${!isSelectedMonth ? "text-grey-c700 hover:bg-primary-c100" : ""}
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
