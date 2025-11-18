import {KeyboardEvent} from "react";

interface Props {
  id?: string;
  htmlFor?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  type?: "text" | "password" | "number";
  typeTextField?: "input" | "textarea";
  rows?: number;
  required?: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  maxLength?: number;
}

export default function TextField(
  {
    id,
    htmlFor,
    label,
    placeholder,
    value,
    onChange,
    disabled = false,
    error = "",
    type = "text",
    typeTextField = "input",
    rows = 4,
    required = false,
    onKeyDown,
    className = "",
    maxLength,
  }: Props) {
  return (
    <div className="relative flex flex-col gap-1 w-full">
      {label &&
          <label htmlFor={htmlFor}
                 className={`absolute z-label -top-3 left-5 px-1 bg-white whitespace-nowrap text-sm font-bold transition-all ${disabled ? "text-grey-c500 bg-grey-c500" : error ? "text-support-c900" : "text-primary-c700"}`}>{label}{required &&
              <span className="text-support-c800"> *</span>}
          </label>
      }
      {typeTextField === "input" ? (
        <input
          id={id}
          type={type}
          autoComplete={type === "password" ? "current-password" : id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          className={`${className} w-full px-5 py-3 border-2 rounded-3xl outline-0 text-grey-c700 transition-all ease-linear
          ${disabled ? "bg-grey-c50 cursor-not-allowed" : error ? " bg-support-c300 border-support-c500 hover:border-support-c700 focus:border-support-c900" : "bg-white border-primary-c300 hover:border-primary-c500 focus:border-primary-c700"} `}
        />
      ) : (
        <div className="relative w-full">
          <textarea
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={`${className} w-full px-5 py-3 border-2 rounded-xl outline-0 text-grey-c700 transition-all ease-linear resize-none
            ${disabled ? "bg-grey-c50 cursor-not-allowed" : error ? "bg-support-c300 border-support-c500 hover:border-support-c700 focus:border-support-c900" : "bg-white border-primary-c300 hover:border-primary-c500 focus:border-primary-c700"} `}
          />
          {maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-grey-c500 bg-white px-2 py-1 rounded">
              {value?.length || 0} / {maxLength}
            </div>
          )}
        </div>
      )}
      {error && <span className="text-sm text-support-c900 ml-5">{error}</span>}
    </div>
  );
}