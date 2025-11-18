import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

interface Props{
  id?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  positionLabel?: "left" | "right";
  disabled?: boolean;

}
export default function CheckBox({
  id,
  checked,
  onChange,
  label,
  positionLabel = "right",
  disabled = false,
}:Props) {

  return (
    <label className={`inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      {positionLabel === "left" && label && (
        <span className="mr-2 text-sm text-grey-c700">{label}</span>
      )}
      <div className="relative flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`
          h-5 w-5 rounded border-2 transition-all duration-200 flex items-center justify-center
          ${disabled 
            ? 'bg-grey-c200 border-grey-c300' 
            : checked 
              ? 'bg-primary-c700 border-primary-c700' 
              : 'bg-white border-grey-c400 hover:border-primary-c500'
          }
        `}>
          {checked && (
            <CheckRoundedIcon
              className="text-white"
              style={{fontSize: 16}}
            />
          )}
        </div>
      </div>
      {positionLabel === "right" && label && (
        <span className="ml-2 text-sm text-grey-c700">{label}</span>
      )}

    </label>
  );
}