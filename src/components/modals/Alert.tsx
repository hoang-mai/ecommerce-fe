"use client";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "@/redux/store";
import {closeAlert} from "@/redux/slice/alertSlice";
import {useEffect, useState} from "react";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {AlertType} from "@/enum";

const alertConfig = {
  [AlertType.ERROR]: {
    bgColor: "bg-support-c200",
    borderColor: "border-support-c900",
    textColor: "text-support-c900",
    icon: <ErrorIcon className="text-support-c900"/>,
  },
  [AlertType.SUCCESS]: {
    bgColor: "bg-success-c100",
    borderColor: "border-success-c700",
    textColor: "text-success-c700",
    icon: <CheckCircleIcon className="text-success-c700"/>,
  },
  [AlertType.WARNING]: {
    bgColor: "bg-yellow-c100",
    borderColor: "border-yellow-c700",
    textColor: "text-yellow-c900",
    icon: <WarningIcon className="text-yellow-c700"/>,
  },
  [AlertType.INFO]: {
    bgColor: "bg-primary-c100",
    borderColor: "border-primary-c700",
    textColor: "text-primary-c900",
    icon: <InfoIcon className="text-primary-c700"/>,
  },
} as const;

export default function Alert() {
  const alertData = useSelector((state: RootState) => state.alert);
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alertData.isOpen) {

      setTimeout(() => setIsVisible(true), 10);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          dispatch(closeAlert());
        }, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alertData.isOpen, dispatch]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch(closeAlert());
    }, 300);
  };

  if (!alertData.isOpen) return null;

  const config = alertConfig[alertData.type as keyof typeof alertConfig];

  return (
    <div className="fixed top-0 w-full z-alert flex justify-center px-4 pt-4">
      <div
        className={`
          ${config.bgColor} ${config.borderColor} ${config.textColor}
          px-6 py-4 rounded-lg shadow-lg border-2 min-w-md
          transition-all duration-300 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}
        `}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{config.icon}</span>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{alertData.title}</h3>
            <p className="text-sm opacity-90">{alertData.message}</p>
          </div>
          <button
            onClick={handleClose}
            className={`${config.textColor} cursor-pointer hover:opacity-70 transition-opacity flex-shrink-0 text-xl leading-none`}
            aria-label="Close alert"
          >
            <CloseRoundedIcon/>
          </button>
        </div>
      </div>
    </div>
  );
}