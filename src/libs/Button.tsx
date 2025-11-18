import {MouseEventHandler, ReactNode, useMemo} from "react";
import {ColorButton} from "@/enum";

type Props = {
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  onClick?: MouseEventHandler;
  type?: "submit" | "button" | "reset";
  fullWidth?: boolean;
  color?: ColorButton;
  disabled?: boolean;
  title?: string;
}
export default function Button(
  {
    children,
    startIcon,
    endIcon,
    className = "",
    type = "button",
    onClick,
    fullWidth = false,
    disabled,
    title,
    color,
  }: Props) {
  const colorAttitude = useMemo(() => {
    return {
      'error': `
                border-2
                border-support-c900
                bg-white 
                font-bold 
                text-support-c900
                `,
      'secondary': `
                bg-grey-c600
                text-white      
                hover:bg-grey-c700
                active:bg-grey-c800
                border-grey-c600
                `,
      'success': `
                bg-green-600
                text-white      
                hover:bg-green-700
                border-green-600
                `,
      'warning': `
                bg-yellow-c600
                text-white      
                hover:bg-yellow-c700
                active:bg-yellow-c800
                `,
      'info': `
                bg-blue-600
                text-white      
                hover:bg-blue-700
                border-blue-600
                `,
      'primary': `
                bg-primary-c600
                text-white
                hover:bg-primary-c700
                active:bg-primary-c800
                `,
    };
  }, [])
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${fullWidth ? "w-full" : ""}
        cursor-pointer
        outline-0
        inline-flex items-center justify-center gap-2
        px-4 py-2
        font-medium text-md
        rounded-md
        transition-all
        duration-500
        hover:shadow-lg
        disabled:cursor-not-allowed disabled:bg-grey-c400 disabled:text-grey-c200
        ${className}
        ${color && colorAttitude[color]}
      `}
    >
      {startIcon && <span>{startIcon}</span>}
      {children}
      {endIcon && <span>{endIcon}</span>}
    </button>
  );
}