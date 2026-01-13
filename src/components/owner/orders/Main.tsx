'use client';
import React, { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import Chip from '@/libs/Chip';
import OrderDetailModal from '@/components/owner/orders/OrderDetailModal';
import DropdownSelect from '@/libs/DropdownSelect';
import TextField from '@/libs/TextField';
import Table, { Column } from '@/libs/Table';
import Title from '@/libs/Title';
import { formatDateTime, formatPrice } from '@/util/fnCommon';
import { AlertType, OrderStatus, SortDir } from '@/types/enum';
import { getLabelStatusColor, getStatusColor, OrderView, statusOptions } from "@/components/user/orders/Main";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useBuildUrl } from "@/hooks/useBuildUrl";
import { ORDER, ORDER_VIEW } from "@/services/api";
import useSWR from "swr";
import { openAlert } from "@/redux/slice/alertSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import { useDispatch } from "react-redux";
import Loading from "@/components/modals/Loading";
import useSWRMutation from "swr/mutation";
import Image from "next/image";
import CancelIcon from '@mui/icons-material/Cancel';
import CancelOrderModal from "@/components/user/orders/CancelOrderModal";

export default function Main() {

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState<string>("");
  const { get, patch } = useAxiosContext();
  const [status, setStatus] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const debounce = useDebounce(keyword);
  const [sortBy, setSortBy] = useState<string>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState("10");
  const [selectedOrder, setSelectedOrder] = useState<OrderView | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const url = useBuildUrl({
    baseUrl: ORDER_VIEW,
    queryParams: {
      isOwner: true,
      orderStatus: status || undefined,
      keyword: debounce || undefined,
      pageNo: currentPage,
      pageSize: parseInt(pageSize, 10),
      sortBy: sortBy,
      sortDir: sortDir,
    }
  })
  const fetcher = (url: string) => get<BaseResponse<PageResponse<OrderView>>>(url).then(res => res.data);
  const { data, isLoading, error, mutate } = useSWR(url, fetcher)

  const fetcherUpdateOrderStatus = (url: string, { arg }: {
    arg: { orderId: string, orderStatus: OrderStatus, reason: string }
  }) =>
    patch<BaseResponse<unknown>>(`${url}/${arg.orderId}/status`, {
      orderStatus: arg.orderStatus,
      reason: arg.reason
    }).then(res => res.data);
  const { trigger, isMutating } = useSWRMutation(ORDER, fetcherUpdateOrderStatus, { revalidate: false })
  const pageData = data?.data;
  const orders = pageData?.data || [];
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
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    trigger({ orderId, orderStatus: newStatus, reason: '' }).then(res => {
      const alert: AlertState = {
        isOpen: true,
        title: "Cập nhật trạng thái đơn hàng",
        message: res.message || "Cập nhật trạng thái đơn hàng thành công",
        type: AlertType.SUCCESS,
      }
      dispatch(openAlert(alert));
      mutate();
    }).catch((errors: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Cập nhật trạng thái đơn hàng thất bại",
        message: errors.message || "Đã có lỗi xảy ra, vui lòng thử lại sau",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert));
    });
  };
  const handleOpenCancelModal = (orderId: string) => {
    setSelectedOrderIdToCancel(orderId);
    setIsCancelModalOpen(true);
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

  const viewOrderDetail = (order: OrderView) => {
    setSelectedOrder(order);
    setIsOpen(true);
  };
  const handleClearSearch = () => {
    setKeyword("");
    setStatus("");
    setCurrentPage(0);
  };
  const columns: Column<OrderView>[] = [
    {
      key: '_id',
      label: 'STT',
      sortable: true,
      render: (row, index) => (
        <div className="text-sm font-semibold text-grey-c900">
          {currentPage * parseInt(pageSize) + index + 1}
        </div>
      )
    },
    {
      key: 'shopName',
      label: 'Shop',
      sortable: true,
      render: (row) => (
        <div className="flex items-center">
          <Image
            src={row.shopLogoUrl}
            alt={row.shopName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-sm font-semibold truncate">{row.shopName}</div>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Khách hàng',
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{row.receiverName}</div>
          <div className="text-xs text-grey-c600">{row.phoneNumber}</div>
        </div>
      )
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      render: (row) => (
        <div className="text-sm flex flex-col">
          <div>
            <div className={"w-40 truncate"}>{row.orderItems[0]?.productName}</div>
            {row.orderItems.length > 1 && (
              <span className="text-xs text-grey-c600"> +{row.orderItems.length - 1}</span>
            )}
          </div>
          <div className="text-xs text-grey-c600">SL: {row.orderItems.reduce((s: number, p) => s + p.quantity, 0)}</div>
        </div>
      )
    },
    {
      key: 'totalPrice',
      label: 'Tổng tiền',
      sortable: true,
      render: (row) => (<div className="font-semibold">{formatPrice(row.totalPrice)}</div>)
    },
    {
      key: 'status', label: 'Trạng thái', render: (row) =>
        <Chip
          label={getLabelStatusColor(row.orderStatus)}
          color={getStatusColor(row.orderStatus)}
        />
    },
    {
      key: 'createdAt',
      label: 'Ngày đặt hàng',
      sortable: true,
      render: (row) => (<span className="text-sm text-grey-c700">{formatDateTime(row.createdAt)}</span>)
    },
    {
      key: 'actions', label: 'Hành động', className: 'text-center', render: (row) => (
        <div className="flex gap-2 justify-start">
          <button onClick={() => viewOrderDetail(row)}
            className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            title="Xem chi tiết"><VisibilityIcon /></button>

          {(row.orderStatus === OrderStatus.PAID) && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.CONFIRMED)}
              title="Xác nhận"
              className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <CheckCircleIcon />
            </button>
          )}
          {row.orderStatus === OrderStatus.CONFIRMED && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.DELIVERED)}
              title="Giao hàng"
              className="cursor-pointer p-2 text-orange-800 hover:bg-orange-200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <MoveToInboxIcon />
            </button>
          )}
          {row.orderStatus === OrderStatus.DELIVERED && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.SHIPPED)}
              title="Giao hàng"
              className="cursor-pointer p-2 text-purple-800 hover:bg-purple-200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <LocalShippingIcon />
            </button>
          )}


          {(row.orderStatus === OrderStatus.SHIPPED) && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.COMPLETED)}
              title="Hoàn thành"
              className="cursor-pointer p-2 text-success-c800 hover:bg-success-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <CheckCircleRoundedIcon />
            </button>
          )}
          {(row.orderStatus === OrderStatus.PAID) && (
            <button
              onClick={() => handleOpenCancelModal(row.orderId)}
              title="Hủy đơn hàng"
              className="cursor-pointer p-2 text-support-c800 hover:bg-support-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <CancelIcon />
            </button>
          )}
        </div>
      )
    },
  ];

  return (
    <div className={"overflow-y-auto min-h-0"}>
      {(isLoading && isMutating) && <Loading />}
      <Title title="Quản lý đơn hàng" isDivide />

      {/* Filters */}
      <div className="flex gap-4 mb-2 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] relative">
          <TextField
            value={keyword}
            onChange={(v) => {
              setKeyword(v);
              setCurrentPage(0);
            }}
            placeholder="Tìm mã đơn, khách hàng, SĐT..."
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') setCurrentPage(0);
            }}
          />
        </div>

        <div className="min-w-[200px]">
          <DropdownSelect
            value={status}
            onChange={(v) => {
              setStatus(v);
              setCurrentPage(0);
            }}
            options={statusOptions}
            placeholder="Trạng thái"
          />
        </div>

      </div>
      {(keyword || status) && (
        <div
          className="mb-4 flex items-center gap-2 text-sm text-grey-c700 bg-primary-c50 px-4 py-3 rounded-lg border border-primary-c200 mt-4">
          <SearchRoundedIcon className="text-primary-c700" />
          <span>
            Tìm thấy <strong className="text-primary-c800">{pageData?.totalElements || 0}</strong> đơn hàng
            {keyword && <> với từ khóa &ldquo;<strong className="text-primary-c800">{keyword}</strong>&rdquo;</>}
            {status && <> - Trạng thái: <strong
              className="text-primary-c800">{statusOptions.find(o => o.id === status)?.label}</strong></>}
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
      <Table<OrderView>
        columns={columns}
        data={orders}
        keyExtractor={(r) => r.orderId}
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
        emptyMessage={keyword || status !== '' ? 'Không tìm thấy đơn hàng phù hợp' : 'Không có đơn hàng'}
      />
      {isOpen && selectedOrder &&
        <OrderDetailModal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} order={selectedOrder} />
      }
      {selectedOrderIdToCancel && isCancelModalOpen && (
        <CancelOrderModal
          isOpen={isCancelModalOpen}
          setIsOpen={setIsCancelModalOpen}
          orderId={selectedOrderIdToCancel}
          mutate={mutate}
          actionType={"CANCELLED"}
        />)}
    </div>
  );
};
