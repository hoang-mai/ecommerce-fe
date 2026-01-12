import {useEffect, useState} from "react";

export default function FlashSaleCountdown({endDate}: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const end = new Date(endDate).getTime();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) return <span className="text-xs text-support-c900">Đã hết hạn</span>;

  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2">
      <div className=" text-grey-c900 border-1 border-primary-c500 px-1 py-1.5 rounded-lg min-w-[50px] text-center">
        <span className=" text-xl font-bold tabular-nums text-grey-c700">{hours.toString().padStart(2, "0")}</span>
      </div>
      <span className="text-2xl font-bold text-slate-400">:</span>
      <div className=" text-grey-c900 border-1 border-primary-c500 px-1 py-1.5 rounded-lg min-w-[50px] text-center">
        <span className=" text-xl font-bold tabular-nums text-grey-c700">{minutes.toString().padStart(2, "0")}</span>
      </div>
      <span className="text-2xl font-bold text-slate-400">:</span>
      <div className=" text-grey-c900 border-1 border-primary-c500 px-1 py-1.5 rounded-lg min-w-[50px] text-center">
        <span className=" text-xl font-bold tabular-nums text-grey-c700">{seconds.toString().padStart(2, "0")}</span>
      </div>
    </div>
  );
}
