
import React, {useEffect, useState} from 'react';
import {NotificationView} from '@/types/interface';
import {NotificationType} from '@/types/enum';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import {getTimeAgo} from "@/util/fnCommon";
import TextField from "@/libs/TextField";
import useSWR, {mutate} from "swr";
import {NOTIFICATION} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {useDebounce} from "@/hooks/useDebounce";
import useSWRMutation from "swr/mutation";
import {useDropdownContext} from "@/libs/DropdownMenu";

type Props ={
  setIsOpenNotification : (isOpen: boolean) => void;
  setNotificationSelected : (notification: NotificationView | null) => void;
}

export default function NotificationPreviewList({ setIsOpenNotification, setNotificationSelected }: Props) {
  const {get} = useAxiosContext();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");
  const [allNotifications, setAllNotifications] = useState<NotificationView[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounce = useDebounce(keyword);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const urlNotifications = useBuildUrl({
    baseUrl: NOTIFICATION,
    queryParams: {
      pageNo: currentPage,
      pageSize: 10,
      keyword: debounce || undefined,
    }
  });

  const fetcherNotifications = (url: string) => get<BaseResponse<PageResponse<NotificationView>>>(url).then(res => res.data);
  const {data: dataNotifications} = useSWR(urlNotifications, fetcherNotifications, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const pageData = dataNotifications?.data;
  const totalPages = pageData?.totalPages || 0;

  useEffect(() => {
    setCurrentPage(0);
    setAllNotifications([]);
  }, [debounce]);

  useEffect(() => {
    const notifications = pageData?.data || [];
    if (notifications.length > 0) {
      if (currentPage === 0) {
        setAllNotifications(notifications);
      } else {
        setAllNotifications(prev => [...prev, ...notifications]);
      }
      setIsLoading(false);
    }
  }, [currentPage, pageData?.data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    if (scrollHeight - scrollTop <= clientHeight + 10) {
      if (!isLoading && currentPage < totalPages - 1) {
        setIsLoading(true);
        setCurrentPage(prev => prev + 1);
      }
    }
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="w-[350px] max-h-[400px] overflow-y-auto">
        <div className={"p-4"}>
          <TextField
            value={keyword}
            onChange={(e) => setKeyword(e)}
            placeholder="Tìm kiếm thông báo..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(0);
              }
            }}
          />
        </div>
        {(!allNotifications || allNotifications.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="text-grey-c400 mb-2">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <p className="text-grey-c600 text-sm">Chưa có thông báo nào</p>
          </div>
        ) : (
          <>
            {allNotifications.map((notification) => (
              <NotificationPreviewItem
                key={notification.notificationId}
                notification={notification}
                setIsOpenNotification={setIsOpenNotification}
                setNotificationSelected={setNotificationSelected}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-c700"></div>
              </div>
            )}
          </>
        )}

      </div>

    </>

  );
}

interface NotificationPreviewItemProps {
  notification: NotificationView;
  setIsOpenNotification: (isOpen: boolean) => void;
  setNotificationSelected: (notification: NotificationView | null) => void;
}

function NotificationPreviewItem({notification,setNotificationSelected,setIsOpenNotification}: NotificationPreviewItemProps) {
  const {patch} = useAxiosContext();
  const {closeDropdown} = useDropdownContext();
  const fetcherMarkAsRead = (url: string, {arg}: {arg: string}) =>
    patch<BaseResponse<void>>(`${url}/${arg}/mark-as-read`).then(res => res.data);

  const {trigger} = useSWRMutation(NOTIFICATION, fetcherMarkAsRead);

  const isUnread = !notification.isRead;

  const handleNotificationClick = () => {
    setNotificationSelected(notification);
    setIsOpenNotification(true);
    if (isUnread) {
      trigger(notification.notificationId).then(() => {
        mutate(`${NOTIFICATION}/unread-count`);
      });
    }
    closeDropdown();
  };

  const getNotificationIcon = () => {
    switch (notification.notificationType) {
      case NotificationType.ERROR:
        return <ErrorRoundedIcon className="text-support-c900"/>;
      case NotificationType.SUCCESS:
        return <CheckCircleRoundedIcon className="text-success-c700"/>;
      case NotificationType.WARNING:
        return <WarningRoundedIcon className="text-yellow-c700"/>;
      case NotificationType.PAYMENT:
        return <PaymentRoundedIcon className="text-primary-c700"/>;
      case NotificationType.INFO:
      default:
        return <InfoRoundedIcon className="text-grey-c700"/>;
    }
  };

  return (
    <div
      onClick={handleNotificationClick}
      className={`flex items-start gap-3 px-4 py-3 transition-colors border-b border-grey-c100 last:border-b-0 hover:bg-grey-c50 cursor-pointer ${
        isUnread ? 'bg-primary-c25' : ''
      }`}
    >
      {/* Icon */}
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isUnread ? 'bg-primary-c100' : 'bg-grey-c100'
        }`}>
          {getNotificationIcon()}
        </div>
        {isUnread && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-support-c900 rounded-full border-2 border-white"/>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <h4 className={`text-sm ${isUnread ? 'font-semibold text-grey-c900' : 'font-medium text-grey-c800'}`}>
            {notification.title}
          </h4>
          {notification.createdAt && (
            <span className="text-xs text-grey-c500 ml-2 flex-shrink-0">
              {getTimeAgo(notification.createdAt)}
            </span>
          )}
        </div>
        <p className={`text-sm line-clamp-2 ${isUnread ? 'font-medium text-grey-c800' : 'text-grey-c600'}`}>
          {notification.message}
        </p>
      </div>
    </div>
  );
}

