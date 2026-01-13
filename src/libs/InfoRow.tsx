import { ReactNode, useState, useRef, useEffect } from "react";

type Props = {
  icon?: ReactNode;
  label: string;
  value?: string | null | ReactNode;
  maxLines?: number;
}

export default function InfoRow({ icon, label, value, maxLines = 3 }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      const actualHeight = contentRef.current.scrollHeight;

      setNeedsExpand(actualHeight > maxHeight);
    }
  }, [value, maxLines]);

  const displayValue = value || 'Chưa cập nhật';

  return (
    <div className="flex items-start gap-3 py-3 border-b border-grey-c200">
      {icon && <div className="text-primary-c600 mt-0.5">{icon}</div>}
      <div className="flex-1">
        <span className="text-sm font-semibold text-grey-c600 block mb-1">
          {label}
        </span>
        <div className="relative">
          <span
            ref={contentRef}
            className={`text-base text-grey-c800 whitespace-pre-wrap block transition-all duration-300 ease-in-out overflow-hidden ${
              !isExpanded && needsExpand ? `line-clamp-${maxLines}` : ''
            }`}
            style={{
              maxHeight: !isExpanded && needsExpand ? `${maxLines * 1.5}rem` : 'none'
            }}
          >
            {displayValue}
          </span>

          {needsExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm font-medium text-primary-c600 hover:text-primary-c700 transition-colors duration-200 flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Thu gọn
                  <svg className="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Xem chi tiết
                  <svg className="w-4 h-4 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}