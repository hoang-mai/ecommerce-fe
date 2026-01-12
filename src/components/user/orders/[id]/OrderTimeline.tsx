import { OrderStatus } from "@/types/enum";
import { ElementType, useEffect, useRef, useState } from 'react';

import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PaymentRoundedIcon from "@mui/icons-material/PaymentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

type TimelineStep = {
  status: OrderStatus;
  label: string;
  icon: ElementType;
}

const timelineSteps: TimelineStep[] = [
  { status: OrderStatus.PENDING, label: 'Chờ xác nhận', icon: AccessTimeRoundedIcon },
  { status: OrderStatus.PAID, label: 'Đã thanh toán', icon: PaymentRoundedIcon },
  { status: OrderStatus.CONFIRMED, label: 'Đã xác nhận', icon: CheckCircleRoundedIcon },
  { status: OrderStatus.DELIVERED, label: 'Đang vận chuyển', icon: MoveToInboxIcon },
  { status: OrderStatus.SHIPPED, label: 'Đang giao', icon: LocalShippingRoundedIcon },
  { status: OrderStatus.COMPLETED, label: 'Hoàn thành', icon: DoneAllRoundedIcon },
  { status: OrderStatus.CANCELLED, label: 'Đã hủy', icon: AccessTimeRoundedIcon },
  { status: OrderStatus.RETURNED, label: 'Đã trả hàng', icon: AccessTimeRoundedIcon },
];

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {

  const baseSteps = timelineSteps.filter(s => s.status !== OrderStatus.CANCELLED && s.status !== OrderStatus.RETURNED);

  const displayedSteps: TimelineStep[] = (() => {
    const steps = [...baseSteps];

    if (currentStatus === OrderStatus.CANCELLED) {
      // insert CANCELLED after PAID
      const paidIndex = steps.findIndex(s => s.status === OrderStatus.PAID);
      const cancelledStep = timelineSteps.find(s => s.status === OrderStatus.CANCELLED)!;
      if (paidIndex >= 0) {
        steps.splice(paidIndex + 1, 0, cancelledStep);
      } else {
        steps.push(cancelledStep);
      }
    }

    if (currentStatus === OrderStatus.RETURNED) {
      const completedIndex = steps.findIndex(s => s.status === OrderStatus.COMPLETED);
      const returnedStep = timelineSteps.find(s => s.status === OrderStatus.RETURNED)!;
      if (completedIndex >= 0) {
        steps.splice(completedIndex + 1, 0, returnedStep);
      } else {
        steps.push(returnedStep);
      }
    }

    return steps;
  })();

  const currentIndex = displayedSteps.findIndex(s => s.status === currentStatus);

  // Refs and state for exact pixel calculation of the filled track
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [filledWidth, setFilledWidth] = useState<number>(0);

  useEffect(() => {
    let raf = 0;
    function compute() {
      const trackEl = trackRef.current;
      const wrapperEl = wrapperRef.current;
      if (!trackEl || !wrapperEl || currentIndex < 0) {
        setFilledWidth(0);
        return;
      }

      const stepEls = wrapperEl.querySelectorAll<HTMLElement>('[data-step-index]');
      if (!stepEls || stepEls.length === 0) {
        setFilledWidth(0);
        return;
      }

      const trackRect = trackEl.getBoundingClientRect();
      const lastIndex = stepEls.length - 1;
      const clampedIndex = Math.max(0, Math.min(currentIndex, lastIndex));

      const currentEl = stepEls[clampedIndex];
      if (!currentEl) {
        setFilledWidth(0);
        return;
      }

      const elRect = currentEl.getBoundingClientRect();
      const centerX = elRect.left + elRect.width / 2;
      const widthPx = Math.max(0, Math.min(trackRect.width, centerX - trackRect.left));
      setFilledWidth(widthPx);
    }

    // compute after layout
    raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
    };
  }, [displayedSteps.length, currentIndex]);

  return (
    <div className="w-full py-4 bg-white rounded-lg shadow-sm border border-grey-c100">
      <div ref={wrapperRef} className="flex items-center justify-between relative">
        <div ref={trackRef} className="absolute top-5 left-0 right-0 h-0.5 bg-border mx-8" />

        <div
          className="absolute top-5 left-0 h-0.5 bg-primary-c700 mx-8 transition-all duration-300"
          style={{ width: `${filledWidth}px` }}
        />

        {displayedSteps.map((step, index) => {
          const Icon: ElementType = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center z-10 flex-1"
            >
              <div
                data-step-index={index}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? "bg-primary-c600 text-white shadow-lg shadow-primary-c600/25"
                  : "bg-grey-c100 text-grey-c500"}
                  ${isCurrent ? "ring-4 ring-primary-c600/20" : ""}`}
              >
                <Icon className="!h-6 !w-6" />
              </div>
              <span
                className={`text-xs mt-2 text-center font-medium transition-colors
                  ${isCompleted ? "text" : "text-grey-c500"}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
