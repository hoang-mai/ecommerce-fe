'use client';

interface Props {
  id?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  positionLabel?: "left" | "right";
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Switch({
  id,
  checked,
  onChange,
  label,
  positionLabel = "left",
  disabled = false,
  size = "md",
}: Props) {

  const sizes = {
    sm: {
      track: "h-5 w-9",
      thumb: "h-4 w-4",
      translate: "translate-x-4",
      padding: "p-0.5",
    },
    md: {
      track: "h-6 w-11",
      thumb: "h-5 w-5",
      translate: "translate-x-5",
      padding: "p-0.5",
    },
    lg: {
      track: "h-7 w-14",
      thumb: "h-6 w-6",
      translate: "translate-x-7",
      padding: "p-0.5",
    },
  };

  const currentSize = sizes[size];

  return (
    <label className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      {positionLabel === "left" && label && (
        <span className="mr-3 text-sm font-bold text-primary-c700">{label}</span>
      )}

      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />

        {/* Track/Background */}
        <div className={`
          ${currentSize.track} ${currentSize.padding}
          rounded-full transition-all duration-300 ease-in-out
          ${disabled 
            ? 'bg-grey-c300' 
            : checked 
              ? 'bg-primary-c700' 
              : 'bg-grey-c400 hover:bg-grey-c500'
          }
        `}>
          {/* Thumb/Circle */}
          <div className={`
            ${currentSize.thumb}
            bg-white rounded-full shadow-md
            transform transition-transform duration-300 ease-in-out
            ${checked ? currentSize.translate : 'translate-x-0'}
          `} />
        </div>
      </div>

      {positionLabel === "right" && label && (
        <span className="ml-3 text-sm font-medium text-grey-c700">{label}</span>
      )}
    </label>
  );
}

