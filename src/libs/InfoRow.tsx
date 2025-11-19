import {ReactNode} from "react";

export const InfoRow = ({icon, label, value}: { icon?: ReactNode; label: string; value?: string | null | ReactNode }) => (
  <div className="flex items-start gap-3 py-3 border-b border-grey-c200">
    {icon && <div className="text-primary-c600 mt-0.5">{icon}</div>}
    <div className="flex-1">
      <span className="text-sm font-semibold text-grey-c600 block mb-1">{label}</span>
      <span className="text-base text-grey-c800">{value || 'Chưa cập nhật'}</span>
    </div>
  </div>
);