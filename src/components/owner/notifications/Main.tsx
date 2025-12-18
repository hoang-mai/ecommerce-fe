'use client';
import React, {useState, useEffect} from 'react';
import Chip, {ChipColor} from '@/libs/Chip';
import DropdownSelect from '@/libs/DropdownSelect';
import TextField from '@/libs/TextField';
import Table, {Column} from '@/libs/Table';
import Title from '@/libs/Title';
import {formatDateTime} from '@/util/FnCommon';
import {AlertType, NotificationType, SortDir} from '@/types/enum';
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import useSWR from "swr";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDebounce} from "@/hooks/useDebounce";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import Loading from "@/components/modals/Loading";
import useSWRMutation from "swr/mutation";
import {NotificationView} from "@/types/interface";
import {NOTIFICATION} from "@/services/api";
import {mutate} from "swr";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import NotificationDetailModal from "@/components/owner/notifications/NotificationDetailModal";

const notificationTypeOptions = [
  {id: '', label: 'Tất cả'},
  {id: NotificationType.ERROR, label: 'Lỗi'},
  {id: NotificationType.SUCCESS, label: 'Thành công'},
  {id: NotificationType.INFO, label: 'Thông tin'},
  {id: NotificationType.WARNING, label: 'Cảnh báo'},
];

// Get notification type color
const getNotificationTypeColor = (type: NotificationType): ChipColor => {
  switch (type) {
    case NotificationType.ERROR:
      return ChipColor.ERROR;
    case NotificationType.SUCCESS:
      return ChipColor.SUCCESS;
    case NotificationType.INFO:
      return ChipColor.INFO;
    case NotificationType.WARNING:
      return ChipColor.WARNING;
    default:
      return ChipColor.INFO;
  }
};

export default function Main() {
  const {get, patch} = useAxiosContext();
  const [notificationType, setNotificationType] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const debounce = useDebounce(keyword);
  const [sortBy, setSortBy] = useState<string>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState("10");
  const [isReadFilter, setIsReadFilter] = useState<string>('');
  const [open , setOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationView | null>(null);
  const dispatch = useDispatch();

  const url = useBuildUrl({
    baseUrl: NOTIFICATION,
    queryParams: {
      notificationType: notificationType || undefined,
      keyword: debounce || undefined,
      isRead: isReadFilter || undefined,
      pageNo: currentPage,
      pageSize: parseInt(pageSize, 10),
      sortBy: sortBy,
      sortDir: sortDir,
    }
  })

  const fetcher = (url: string) => get<BaseResponse<PageResponse<NotificationView>>>(url).then(res => res.data);
  const {data, isLoading, error, mutate: mutateTable} = useSWR(url, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const fetcherMarkAsRead = (url: string, {arg}: { arg: { notificationId: string } }) =>
    patch<BaseResponse<unknown>>(`${url}/${arg.notificationId}/mark-as-read`, {}).then(res => res.data);
  const {trigger: triggerMarkAsRead} = useSWRMutation(NOTIFICATION, fetcherMarkAsRead, {revalidate: false})

  const pageData = data?.data;
  const notifications = pageData?.data || [];
  const totalPages = pageData?.totalPages || 0;

  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }
  }, [dispatch, error]);

  const handleViewNotification = (notification: NotificationView) => {
    if(notification.isRead) {
      setNotification(notification);
      setOpen(true);
      return;
    }
    triggerMarkAsRead({ notificationId: notification.notificationId }).then(() => {
      mutate(`${NOTIFICATION}/unread-count`)
      mutateTable();
    }).catch((errors: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Đánh dấu đã đọc thất bại",
        message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert));
    });
    setNotification(notification);
    setOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === SortDir.ASC ? SortDir.DESC : SortDir.ASC);
    } else {
      setSortBy(column);
      setSortDir(SortDir.ASC);
    }
    setCurrentPage(0);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setNotificationType("");
    setIsReadFilter("");
    setCurrentPage(0);
  };
  const columns: Column<NotificationView>[] = [
    {
      key: 'notificationId',
      label: 'Mã thông báo',
      sortable: true,
      render: (row) => (
        <div className="text-sm font-semibold text-grey-c900">
          #{row.notificationId.substring(0, 8)}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      sortable: true,
      render: (row) => (
        <div className={`text-sm ${!row.isRead ? 'font-bold text-grey-c900' : 'text-grey-c700'}`}>
          {row.title}
        </div>
      )
    },
    {
      key: 'message',
      label: 'Nội dung',
      render: (row) => (
        <div className="text-sm text-grey-c600 max-w-[300px] truncate">
          {row.message}
        </div>
      )
    },
    {
      key: 'notificationType',
      label: 'Loại',
      sortable: true,
      render: (row) => {
        const typeOption = notificationTypeOptions.find(opt => opt.id === row.notificationType);
        return (
          <Chip
            label={typeOption?.label || 'Không xác định'}
            color={getNotificationTypeColor(row.notificationType)}
          />
        );
      }
    },
    {
      key: 'isRead',
      label: 'Trạng thái',
      sortable: true,
      render: (row) => (
        <Chip
          label={row.isRead ? 'Đã đọc' : 'Chưa đọc'}
          color={row.isRead ? ChipColor.SUCCESS : ChipColor.WARNING}
        />
      )
    },
    {
      key: 'createdAt',
      label: 'Thời gian',
      sortable: true,
      render: (row) => (
        <span className="text-sm text-grey-c700">{formatDateTime(row.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      label: 'Hành động',
      className: 'text-center',
      render: (row) => (
        <div className="flex gap-2 justify-center">

            <button
              onClick={() => handleViewNotification(row)}
              className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-md"
              title="Xem chi tiết"
            >
              <VisibilityRoundedIcon/>
            </button>

        </div>
      )
    },
  ];

  return (
    <div className={"overflow-y-auto min-h-0"}>
      {(isLoading) && <Loading/>}
      <Title title="Quản lý thông báo" isDivide/>

      {/* Filters */}
      <div className="flex gap-4 mb-2 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(v) => {
              setKeyword(v);
              setCurrentPage(0);
            }}
            placeholder="Tìm tiêu đề, nội dung..."
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') setCurrentPage(0);
            }}
          />
        </div>

        <div className="min-w-[200px]">
          <DropdownSelect
            value={notificationType}
            onChange={(v) => {
              setNotificationType(v);
              setCurrentPage(0);
            }}
            label={"Loại"}
            options={notificationTypeOptions}
            placeholder="Loại thông báo"
          />
        </div>

        <div className="min-w-[150px]">
          <DropdownSelect
            label={"Trạng thái"}
            value={isReadFilter}
            onChange={(v) => {
              setIsReadFilter(v);
              setCurrentPage(0);
            }}
            options={[
              {id: '', label: 'Tất cả'},
              {id: 'true', label: 'Đã đọc'},
              {id: 'false', label: 'Chưa đọc'},
            ]}
            placeholder="Trạng thái"
          />
        </div>
      </div>

      {(keyword || notificationType || isReadFilter) && (
        <div
          className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200 mt-4">
          <SearchRoundedIcon className="text-primary-c700"/>
          <span>
            Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> thông báo
            {keyword && <> với từ khóa &ldquo;<strong className="text-primary-c800">{keyword}</strong>&rdquo;</>}
            {notificationType && <> - Loại: <strong
              className="text-primary-c800">{notificationTypeOptions.find(o => o.id === notificationType)?.label}</strong></>}
            {isReadFilter && <> - Trạng thái: <strong
              className="text-primary-c800">{isReadFilter === 'true' ? 'Đã đọc' : 'Chưa đọc'}</strong></>}
          </span>
          <button
            onClick={handleClearSearch}
            className="ml-auto text-primary-c700 hover:text-primary-c900 underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Table */}
      <Table<NotificationView>
        columns={columns}
        data={notifications}
        keyExtractor={(r) => r.notificationId}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setCurrentPage(p)}
        pageSize={pageSize}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        setPageSize={(s) => {
          setPageSize(s);
          setCurrentPage(0);
        }}
        emptyMessage={keyword || notificationType || isReadFilter ? 'Không tìm thấy thông báo phù hợp' : 'Không có thông báo'}
      />
      {open && notification && <NotificationDetailModal isOpen={open} onClose={() => setOpen(false)} notification={notification}/>}
    </div>
  );
};
