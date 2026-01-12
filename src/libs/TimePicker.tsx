"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// Parse time string to hours, minutes, seconds - moved outside component
const parseTime = (timeStr: string | undefined) => {
  if (!timeStr) return { hour: 0, minute: 0, second: 0 };
  const parts = timeStr.split(":");
  return {
    hour: parseInt(parts[0]) || 0,
    minute: parseInt(parts[1]) || 0,
    second: parseInt(parts[2]) || 0,
  };
};

interface Props {
  id?: string;
  htmlFor?: string;
  label?: string;
  placeholder?: string;
  value?: string; // Format: "HH:mm" or "HH:mm:ss"
  onChange?: (time: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
  timeFormat?: "12h" | "24h";
  showSeconds?: boolean;
}

export default function TimePicker({
  id,
  htmlFor,
  label,
  placeholder = "Chọn giờ",
  value,
  onChange,
  disabled = false,
  error = "",
  required = false,
  className = "",
  timeFormat = "24h",
  showSeconds = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const initialTime = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
  const [selectedSecond, setSelectedSecond] = useState(initialTime.second);
  const [isPM, setIsPM] = useState(initialTime.hour >= 12);

  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Sync state when picker opens with the current value
  const syncStateWithValue = useCallback(() => {
    const parsed = parseTime(value);
    setSelectedHour(parsed.hour);
    setSelectedMinute(parsed.minute);
    setSelectedSecond(parsed.second);
    setIsPM(parsed.hour >= 12);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
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

  const handleHourChange = (hour: number) => {
    if (timeFormat === "12h") {
      const adjustedHour = isPM
        ? hour === 12
          ? 12
          : hour + 12
        : hour === 12
        ? 0
        : hour;
      setSelectedHour(adjustedHour);
    } else {
      setSelectedHour(hour);
    }
  };

  const handleHourInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    if (timeFormat === "12h") {
      const clampedVal = Math.max(1, Math.min(12, val));
      handleHourChange(clampedVal);
    } else {
      const clampedVal = Math.max(0, Math.min(23, val));
      setSelectedHour(clampedVal);
    }
  };

  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    const clampedVal = Math.max(0, Math.min(59, val));
    setSelectedMinute(clampedVal);
  };

  const handleSecondInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    const clampedVal = Math.max(0, Math.min(59, val));
    setSelectedSecond(clampedVal);
  };

  const getDisplayHour = () => {
    if (timeFormat === "12h") {
      const hour = selectedHour % 12;
      return hour === 0 ? 12 : hour;
    }
    return selectedHour;
  };

  const formatTimeString = (hour: number, minute: number, second: number) => {
    const h = String(hour).padStart(2, "0");
    const m = String(minute).padStart(2, "0");
    if (showSeconds) {
      const s = String(second).padStart(2, "0");
      return `${h}:${m}:${s}`;
    }
    return `${h}:${m}`;
  };

  const handleTimeConfirm = () => {
    const timeString = formatTimeString(
      selectedHour,
      selectedMinute,
      selectedSecond
    );
    if (onChange) {
      onChange(timeString);
    }
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return "";
    if (timeFormat === "12h") {
      const displayH = getDisplayHour();
      const ampm = selectedHour >= 12 ? "PM" : "AM";
      if (showSeconds) {
        return `${String(displayH).padStart(2, "0")}:${String(
          selectedMinute
        ).padStart(2, "0")}:${String(selectedSecond).padStart(
          2,
          "0"
        )} ${ampm}`;
      }
      return `${String(displayH).padStart(2, "0")}:${String(
        selectedMinute
      ).padStart(2, "0")} ${ampm}`;
    }
    return value;
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
          value={getDisplayValue()}
          onClick={() => {
            if (!disabled) {
              syncStateWithValue();
              setIsOpen(!isOpen);
            }
          }}
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
        <AccessTimeIcon
          className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer ${
            disabled ? "text-grey-c500" : "text-primary-c700"
          }`}
          onClick={() => {
            if (!disabled) {
              syncStateWithValue();
              setIsOpen(!isOpen);
            }
          }}
        />
      </div>

      {typeof window !== "undefined" &&
        isOpen &&
        isPositioned &&
        !disabled &&
        createPortal(
          <div
            ref={pickerRef}
            className="fixed bg-white border-2 border-primary-c300 rounded-xl shadow-lg p-4 z-[9999] w-80"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <AccessTimeIcon className="text-primary-c700" />
              <span className="text-sm font-bold text-grey-c700">Chọn giờ</span>
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary-c700 mb-4">
              <span>{String(getDisplayHour()).padStart(2, "0")}</span>
              <span>:</span>
              <span>{String(selectedMinute).padStart(2, "0")}</span>
              {showSeconds && (
                <>
                  <span>:</span>
                  <span>{String(selectedSecond).padStart(2, "0")}</span>
                </>
              )}
              {timeFormat === "12h" && (
                <span className="text-2xl ml-2">{isPM ? "PM" : "AM"}</span>
              )}
            </div>

            {/* Time Input Fields */}
            <div className="flex gap-3 items-end">
              {/* Hour Input */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-grey-c700 mb-2">
                  Giờ
                </label>
                <input
                  type="number"
                  min={timeFormat === "12h" ? 1 : 0}
                  max={timeFormat === "12h" ? 12 : 23}
                  value={getDisplayHour()}
                  onChange={handleHourInput}
                  className="w-full px-3 py-3 border-2 border-primary-c300 rounded-lg outline-0 text-grey-c700 text-center text-xl font-bold focus:border-primary-c700 transition-all"
                />
              </div>

              {/* Minute Input */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-grey-c700 mb-2">
                  Phút
                </label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={selectedMinute}
                  onChange={handleMinuteInput}
                  className="w-full px-3 py-3 border-2 border-primary-c300 rounded-lg outline-0 text-grey-c700 text-center text-xl font-bold focus:border-primary-c700 transition-all"
                />
              </div>

              {/* Second Input */}
              {showSeconds && (
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-grey-c700 mb-2">
                    Giây
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={selectedSecond}
                    onChange={handleSecondInput}
                    className="w-full px-3 py-3 border-2 border-primary-c300 rounded-lg outline-0 text-grey-c700 text-center text-xl font-bold focus:border-primary-c700 transition-all"
                  />
                </div>
              )}

              {/* AM/PM Selector for 12h format */}
              {timeFormat === "12h" && (
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-semibold text-grey-c700 mb-2 invisible">
                    .
                  </label>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPM(false);
                        if (selectedHour >= 12) {
                          setSelectedHour(selectedHour - 12);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors font-semibold cursor-pointer text-sm
                        ${
                          !isPM
                            ? "bg-primary-c700 text-white"
                            : "bg-grey-c100 text-grey-c700 hover:bg-primary-c100"
                        }
                      `}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPM(true);
                        if (selectedHour < 12) {
                          setSelectedHour(selectedHour + 12);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg transition-colors font-semibold cursor-pointer text-sm
                        ${
                          isPM
                            ? "bg-primary-c700 text-white"
                            : "bg-grey-c100 text-grey-c700 hover:bg-primary-c100"
                        }
                      `}
                    >
                      PM
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex gap-2 pt-4 mt-4 border-t border-primary-c200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-4 bg-grey-c100 text-grey-c700 rounded-lg hover:bg-grey-c200 transition-colors font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleTimeConfirm}
                className="flex-1 py-2 px-4 bg-primary-c700 text-white rounded-lg hover:bg-primary-c800 transition-colors font-semibold"
              >
                Xác nhận
              </button>
            </div>
          </div>,
          document.body
        )}

      {error && <span className="text-sm text-support-c900 ml-5">{error}</span>}
    </div>
  );
}

