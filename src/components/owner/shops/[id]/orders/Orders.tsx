'use client';
import React, {useState, useEffect} from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import Chip from '@/libs/Chip';
import OrderDetailModal from '@/components/owner/orders/OrderDetailModal';
import DropdownSelect from '@/libs/DropdownSelect';
import TextField from '@/libs/TextField';
import Table, {Column} from '@/libs/Table';
import Title from '@/libs/Title';
import {formatDateTime, formatPrice} from '@/util/FnCommon';
import {AlertType, OrderStatus} from '@/types/enum';
import {getLabelStatusColor, getStatusColor, OrderView, statusOptions} from "@/components/user/orders/Main";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {ORDER, ORDER_VIEW} from "@/services/api";
import useSWR from "swr";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDebounce} from "@/hooks/useDebounce";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import Loading from "@/components/modals/Loading";
import useSWRMutation from "swr/mutation";

const mockOrders: OrderView[] = [
  // Convert mock data to OrderView shape (shopId uses numeric string to match `shops` options)
  {
    orderId: 'ORD001',
    userId: 'USER-1',
    shopId: '1',
    shopName: 'Shop Thời Trang ABC',
    shopLogoUrl: '',
    orderStatus: OrderStatus.PENDING,
    reason: '',
    totalPrice: 650000,
    paymentId: 'COD',
    receiverName: 'Nguyễn Văn A',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    phoneNumber: '0901234567',
    createdAt: '2024-12-02 10:30',
    orderItems: [
      {
        orderItemId: 'i1',
        productId: 'p1',
        productName: 'Áo thun nam basic',
        productImageUrl: '',
        productVariantId: 'v1',
        price: 150000,
        quantity: 2,
        totalPrice: 300000,
        totalDiscount: 0,
        totalFinalPrice: 300000,
        productAttributes: [
          {attributeName: 'Màu sắc', attributeValue: 'Trắng'},
          {attributeName: 'Kích cỡ', attributeValue: 'L'},
        ]
      },
      {
        orderItemId: 'i2',
        productId: 'p2',
        productName: 'Quần jean slim fit',
        productImageUrl: '',
        productVariantId: 'v2',
        price: 350000,
        quantity: 1,
        totalPrice: 350000,
        totalDiscount: 0,
        totalFinalPrice: 350000,
        productAttributes: []
      },
    ],
    ownerId: ""
  },
  {
    orderId: 'ORD002',
    userId: 'USER-2',
    shopId: '2',
    shopName: 'Shop Điện Tử XYZ',
    shopLogoUrl: '',
    orderStatus: OrderStatus.CONFIRMED,
    reason: '',
    totalPrice: 1200000,
    paymentId: 'BANK',
    receiverName: 'Trần Thị B',
    address: '456 Lê Lợi, Q.3, TP.HCM',
    phoneNumber: '0912345678',
    createdAt: '2024-12-02 09:15',
    orderItems: [
      {
        orderItemId: 'i3',
        productId: 'p3',
        productName: 'Tai nghe Bluetooth Sony',
        productImageUrl: '',
        productVariantId: 'v3',
        price: 1200000,
        quantity: 1,
        totalPrice: 1200000,
        totalDiscount: 0,
        totalFinalPrice: 1200000,
        productAttributes: []
      }
    ],
    ownerId: ""
  },
  {
    orderId: 'ORD003',
    userId: 'USER-3',
    shopId: '1',
    shopName: 'Shop Thời Trang ABC',
    shopLogoUrl: '',
    orderStatus: OrderStatus.SHIPPED,
    reason: '',
    totalPrice: 450000,
    paymentId: 'COD',
    receiverName: 'Lê Văn C',
    address: '789 Trần Hưng Đạo, Q.5, TP.HCM',
    phoneNumber: '0923456789',
    createdAt: '2024-12-01 14:20',
    orderItems: [
      {
        orderItemId: 'i4',
        productId: 'p4',
        productName: 'Giày sneaker trắng',
        productImageUrl: '',
        productVariantId: 'v4',
        price: 450000,
        quantity: 1,
        totalPrice: 450000,
        totalDiscount: 0,
        totalFinalPrice: 450000,
        productAttributes: []
      }
    ],
    ownerId: ""
  },
  {
    orderId: 'ORD004',
    userId: 'USER-4',
    shopId: '3',
    shopName: 'Shop Mỹ Phẩm 123',
    shopLogoUrl: '',
    orderStatus: OrderStatus.COMPLETED,
    reason: '',
    totalPrice: 780000,
    paymentId: 'BANK',
    receiverName: 'Phạm Thị D',
    address: '321 Võ Văn Tần, Q.3, TP.HCM',
    phoneNumber: '0934567890',
    createdAt: '2024-11-30 16:45',
    orderItems: [
      {
        orderItemId: 'i5',
        productId: 'p5',
        productName: 'Son môi Maybelline',
        productImageUrl: '',
        productVariantId: 'v5',
        price: 180000,
        quantity: 2,
        totalPrice: 360000,
        totalDiscount: 0,
        totalFinalPrice: 360000,
        productAttributes: []
      },
      {
        orderItemId: 'i6',
        productId: 'p6',
        productName: 'Kem chống nắng Anessa',
        productImageUrl: '',
        productVariantId: 'v6',
        price: 420000,
        quantity: 1,
        totalPrice: 420000,
        totalDiscount: 0,
        totalFinalPrice: 420000,
        productAttributes: []
      }
    ],
    ownerId: ""
  },
  {
    orderId: 'ORD005',
    userId: 'USER-5',
    shopId: '2',
    shopName: 'Shop Điện Tử XYZ',
    shopLogoUrl: '',
    orderStatus: OrderStatus.CANCELLED,
    reason: 'Khách hàng hủy - Đổi ý',
    totalPrice: 850000,
    paymentId: 'COD',
    receiverName: 'Hoàng Văn E',
    address: '555 Pasteur, Q.1, TP.HCM',
    phoneNumber: '0945678901',
    createdAt: '2024-11-29 11:20',
    orderItems: [
      {
        orderItemId: 'i7',
        productId: 'p7',
        productName: 'Chuột gaming Logitech',
        productImageUrl: '',
        productVariantId: 'v7',
        price: 850000,
        quantity: 1,
        totalPrice: 850000,
        totalDiscount: 0,
        totalFinalPrice: 850000,
        productAttributes: []
      }
    ],
    ownerId: ""
  }
];
interface Props {
  id: string;
}
export default function Orders({id}: Props) {


  const {get, patch} = useAxiosContext();
  const [status, setStatus] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const debounce = useDebounce(keyword);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState("10");
  const [selectedOrder, setSelectedOrder] = useState<OrderView | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const url = useBuildUrl({
    baseUrl: ORDER_VIEW,
    queryParams: {
      isOwner: true,
      shopId: id,
      orderStatus: status || undefined,
      keyword: debounce || undefined,
      pageNo: currentPage,
      pageSize: parseInt(pageSize, 10),
    }
  })
  const fetcher = (url: string) => get<BaseResponse<PageResponse<OrderView>>>(url).then(res => res.data);
  const {data, isLoading, error, mutate} = useSWR(url, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })

  const fetcherUpdateOrderStatus = (url: string, {arg}: {
    arg: { orderId: string, orderStatus: OrderStatus, reason: string }
  }) =>
    patch<BaseResponse<unknown>>(`${url}/${arg.orderId}/status`, {
      orderStatus: arg.orderStatus,
      reason: arg.reason
    }).then(res => res.data);
  const {trigger, isMutating} = useSWRMutation(ORDER, fetcherUpdateOrderStatus, {revalidate: false})
  const pageData = data?.data;
  const orders = pageData?.data || mockOrders;
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
    trigger({orderId, orderStatus: newStatus, reason: ''}).then(res => {
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
      key: 'orderId',
      label: 'Mã đơn',
      sortable: true,
      render: (row) => (
        <div className="text-sm font-semibold text-grey-c900">{row.orderId}
          <div className="text-xs text-grey-c600">{row.paymentId}</div>
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
        <div className="text-sm">
          <div>
            {row.orderItems[0]?.productName}
            {row.orderItems.length > 1 && (
              <span className="text-xs text-grey-c600"> +{row.orderItems.length - 1}</span>
            )}
          </div>
          <div className="text-xs text-grey-c600">SL: {row.orderItems.reduce((s: number, p) => s + p.quantity, 0)}</div>
        </div>
      )
    },
    {
      key: 'total',
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
      label: 'Thời gian',
      sortable: true,
      render: (row) => (<span className="text-sm text-grey-c700">{formatDateTime(row.createdAt)}</span>)
    },
    {
      key: 'actions', label: 'Hành động', className: 'text-center', render: (row) => (
        <div className="flex gap-2 justify-center">
          <button onClick={() => viewOrderDetail(row)}
                  className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
                  title="Xem chi tiết"><VisibilityIcon/></button>

          {(row.orderStatus === OrderStatus.PAID) && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.CONFIRMED)}
              title="Xác nhận"
              className="cursor-pointer p-2 text-primary-c800 hover:bg-primary-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <CheckCircleIcon/>
            </button>
          )}
          {row.orderStatus === OrderStatus.CONFIRMED && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.DELIVERED)}
              title="Giao hàng"
              className="cursor-pointer p-2 text-orange-800 hover:bg-orange-200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <MoveToInboxIcon/>
            </button>
          )}
          {row.orderStatus === OrderStatus.DELIVERED && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.SHIPPED)}
              title="Giao hàng"
              className="cursor-pointer p-2 text-purple-800 hover:bg-purple-200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <LocalShippingIcon/>
            </button>
          )}


          {(row.orderStatus === OrderStatus.SHIPPED) && (
            <button
              onClick={() => handleUpdateStatus(row.orderId, OrderStatus.COMPLETED)}
              title="Hoàn thành"
              className="cursor-pointer p-2 text-success-c800 hover:bg-success-c200 rounded-lg transition-colors hover:scale-110 hover:shadow-md"
            >
              <CheckCircleRoundedIcon/>
            </button>
          )}

        </div>
      )
    },
  ];

  return (
    <div>
      {isLoading && isMutating && <Loading/>}
      <Title title="Quản lý đơn hàng" isDivide/>

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
          <SearchRoundedIcon className="text-primary-c700"/>
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
        setPageSize={(s) => {
          setPageSize(s);
          setCurrentPage(0);
        }}
        emptyMessage={keyword || status !== '' ? 'Không tìm thấy đơn hàng phù hợp' : 'Không có đơn hàng'}
      />
      {isOpen && selectedOrder &&
        <OrderDetailModal isOpen={isOpen} setIsOpen={() => setIsOpen(false)} order={selectedOrder}/>
      }
    </div>
  );
};
