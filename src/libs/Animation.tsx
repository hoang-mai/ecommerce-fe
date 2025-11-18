import {ReactNode, useEffect, useRef, useState, MouseEvent} from "react";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export default function Animation({
                                    isOpen,
                                    onClose,
                                    children,
                                    className = ''
                                  }: Props) {
  const [isVisible, setIsVisible] = useState<boolean>(isOpen);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && !isVisible) {
      queueMicrotask(() => setIsVisible(true));
    } else if (!isOpen && isVisible) {
      queueMicrotask(() => setIsAnimating(false));
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, isVisible]);

  useEffect(() => {
    if (isVisible && !isAnimating && isOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsAnimating(true);
      }, 10);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isVisible, isAnimating, isOpen]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`transition-all duration-200 ${
        isAnimating
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      } ${className}`}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
}