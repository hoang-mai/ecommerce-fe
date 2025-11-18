"use client";
import {useState, useRef, useEffect} from "react";
import {createPortal} from "react-dom";
import {useDebounce} from "@/hooks/useDebounce";

interface Props {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onSearch?: (keyword: string) => void;
  onSelect?: (id: string, label: string) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  options: Option[];
  isLoading?: boolean;
  debounceTime?: number;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function TextSearch({
  id,
  label,
  placeholder,
  value = "",
  onSearch,
  onSelect,
  disabled = false,
  error = "",
  required = false,
  options,
  isLoading = false,
  debounceTime = 300,
  hasMore = false,
  onLoadMore,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);

  // Update refs when props change
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      onSearch?.(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
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

  useEffect(() => {
    if (!isOpen || !isPositioned) {
      isLoadingMoreRef.current = false;
      return;
    }

    let scrollElement: HTMLDivElement | null = null;
    let cleanupFn: (() => void) | null = null;

    // Add small delay to ensure portal DOM is rendered
    const timeoutId = setTimeout(() => {
      const handleScroll = () => {
        if (!scrollRef.current || !hasMoreRef.current || isLoadingRef.current || isLoadingMoreRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const scrollPercentage = ((scrollTop + clientHeight) / scrollHeight) * 100;

        if (scrollPercentage > 80) {
          isLoadingMoreRef.current = true;
          onLoadMore?.();
        }
      };

      scrollElement = scrollRef.current;

      if (scrollElement) {
        scrollElement.addEventListener("scroll", handleScroll);
        cleanupFn = () => {
          scrollElement?.removeEventListener("scroll", handleScroll);
        };
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanupFn?.();
      isLoadingMoreRef.current = false;
    };
  }, [onLoadMore, isOpen, isPositioned]);

  // Reset loading flag when loading state changes
  useEffect(() => {
    if (!isLoading) {
      isLoadingMoreRef.current = false;
    }
  }, [isLoading]);

  const handleInputChange = (val: string) => {
    setSearchTerm(val);
    setIsOpen(true);
  };

  const handleSelectOption = (option: Option) => {
    setSearchTerm(option.label);
    setIsOpen(false);
    onSelect?.(option.id.toString(), option.label);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={id}
          className={`absolute -top-3 left-5 bg-white whitespace-nowrap text-sm font-bold transition-all z-50 px-1 ${
            disabled
              ? "text-grey-c500"
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
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
          className={`w-full px-5 py-3 border-2 rounded-3xl outline-0 transition-all ease-linear ${
            isLoading || searchTerm ? "pr-12" : ""
          } ${
            !searchTerm ? "text-grey-c400" : "text-grey-c700"
          } ${
            disabled
              ? "bg-grey-c50 cursor-not-allowed"
              : error
              ? "bg-support-c300 border-support-c500 hover:border-support-c700"
              : isOpen
              ? "bg-white border-primary-c700"
              : "bg-white border-primary-c300 hover:border-primary-c500"
          }`}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-primary-c500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        {!isLoading && searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-grey-c600 hover:text-grey-c700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {typeof window !== 'undefined' && isOpen && isPositioned && !disabled && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white border-2 border-primary-c500 rounded-2xl shadow-lg z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
          }}
        >
          {isLoading && options.length === 0 && (
            <div className="p-5">
              <div className="flex items-center justify-center gap-2 text-grey-c500">
                <svg
                  className="animate-spin h-5 w-5 text-primary-c500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Đang tìm kiếm...</span>
              </div>
            </div>
          )}
          {options.length > 0 && (
            <div ref={scrollRef} className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="px-5 py-3 cursor-pointer transition-all hover:bg-primary-c100 first:rounded-t-2xl last:rounded-b-2xl text-grey-c700"
                >
                  {option.label}
                </div>
              ))}
              {hasMore && (
                <div className="px-5 py-3 flex items-center justify-center gap-2 text-grey-c500">
                  <svg
                    className="animate-spin h-4 w-4 text-primary-c500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm">Đang tải thêm...</span>
                </div>
              )}
            </div>
          )}
          {!isLoading && searchTerm && options.length === 0 && (
            <div className="p-5">
              <p className="text-grey-c500 text-center">Không tìm thấy kết quả</p>
            </div>
          )}
        </div>,
        document.body
      )}

      {error && <span className="text-sm text-support-c900 ml-5">{error}</span>}
    </div>
  );
}
