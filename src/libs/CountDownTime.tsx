import {useEffect, useState} from "react";

export default function CountdownTimer({endDate}: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const end = new Date(endDate).getTime();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
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
  }, [timeLeft]);

  if (timeLeft <= 0) return <span className="text-xs text-red-500">Đã hết hạn</span>;

  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="text-xs text-orange-500">
        Còn lại: {days > 0 ? `${days} ngày ` : ""}{hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
  );
}