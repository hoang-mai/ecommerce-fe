'use client';
import React, {useEffect, useState} from 'react';
import Title from "@/libs/Title";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import { formatPrice} from "@/util/fnCommon";
import {AlertType, OrderStatus} from "@/types/enum";
import Divide from "@/libs/Divide";
import Chip, {ChipColor} from "@/libs/Chip";
import {useDebounce} from "@/hooks/useDebounce";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {ORDER_VIEW} from "@/services/api";
import useSWR from "swr";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import {useDispatch} from "react-redux";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Image from "next/image";
import Pagination from "@/libs/Pagination";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {useRouter} from "next/navigation";
import CancelOrderModal from "@/components/user/orders/CancelOrderModal";
import CancelIcon from "@mui/icons-material/Cancel";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";

interface ProductAttribute {
  attributeName: string;
  attributeValue: string;
}

export interface OrderItem {
  orderItemId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productVariantId: string;
  price: number;
  quantity: number;
  totalPrice: number;
  totalDiscount: number;
  totalFinalPrice: number;
  productAttributes: ProductAttribute[];
}

export interface OrderView {
  orderId: string;
  orderCode: string;
  userId: string;
  shopId: string;
  ownerId: string;
  shopName: string;
  shopLogoUrl: string;
  orderStatus: OrderStatus;
  reason: string;
  totalPrice: number;
  paymentId: string;
  receiverName: string;
  address: string;
  phoneNumber: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export const getLabelStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Chờ xác nhận';
    case OrderStatus.PAID:
      return 'Đã thanh toán';
    case OrderStatus.CONFIRMED:
      return 'Đã xác nhận';
    case OrderStatus.DELIVERED:
      return 'Đang vận chuyển';
    case OrderStatus.SHIPPED:
      return 'Đang giao';
    case OrderStatus.CANCELLED:
      return 'Đã hủy';
    case OrderStatus.RETURNED:
      return 'Đã trả hàng';
    case OrderStatus.COMPLETED:
      return 'Hoàn thành';
    default:
      return '';
  }
};

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return ChipColor.PENDING;
    case OrderStatus.CONFIRMED:
      return ChipColor.CONFIRMED;
    case OrderStatus.PAID:
      return ChipColor.PAID;
    case OrderStatus.SHIPPED:
      return ChipColor.SHIPPED;
    case OrderStatus.DELIVERED:
      return ChipColor.DELIVERED;
    case OrderStatus.COMPLETED:
      return ChipColor.COMPLETED;
    case OrderStatus.CANCELLED:
      return ChipColor.CANCELLED;
    case OrderStatus.RETURNED:
      return ChipColor.RETURNED;
  }
};

export const statusOptions: Option[] = [
  {id: '', label: 'Tất cả trạng thái'},
  {id: OrderStatus.PENDING, label: 'Chờ xác nhận'},
  {id: OrderStatus.PAID, label: 'Đã thanh toán'},
  {id: OrderStatus.CONFIRMED, label: 'Đã xác nhận'},
  {id: OrderStatus.SHIPPED, label: 'Đang giao'},
  {id: OrderStatus.DELIVERED, label: 'Đang vận chuyển'},
  {id: OrderStatus.COMPLETED, label: 'Hoàn thành'},
  {id: OrderStatus.RETURNED, label: 'Đã trả hàng'},
  {id: OrderStatus.CANCELLED, label: 'Đã hủy'},
];

export default function Main() {
  const {get} = useAxiosContext();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState<string>("");
  const [actionType, setActionType] = useState<"CANCELLED" | "RETURNED">("CANCELLED");
  const [pageNo, setPageNo] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [keyword, setKeyword] = useState<string>('');
  const debounce = useDebounce(keyword);
  const dispatch = useDispatch();
  const router = useRouter();
  const url = useBuildUrl({
    baseUrl: ORDER_VIEW,
    queryParams: {
      orderStatus: status || undefined,
      keyword: debounce || undefined,
      pageNo,
      pageSize: 5,
    }
  })
  const fetcher = (url: string) => get<BaseResponse<PageResponse<OrderView>>>(url).then(res => res.data);
  const {data, isLoading, error, mutate} = useSWR(url, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  })
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

  const handleClearSearch = () => {
    setKeyword("");
    setStatus("");
    setPageNo(0);
  };

  const handleOpenCancelModal = (orderId: string, type: "CANCELLED" | "RETURNED" = "CANCELLED") => {
    setSelectedOrderIdToCancel(orderId);
    setActionType(type);
    setIsCancelModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {isLoading && <Loading/>}
      <Title title={"Quản lý đơn hàng"}/>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-c200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <TextField
                value={keyword}
                onChange={(e) => setKeyword(e)}
                placeholder="Tìm kiếm theo tên, mô tả danh mục..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPageNo(0);
                  }
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[200px]">
              <DropdownSelect
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPageNo(0);
                }}
                options={statusOptions}
                placeholder="Chọn trạng thái"
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
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4 ">
          {orders.map((order) => (
            <div key={order.orderId}
                 className="bg-white rounded-lg shadow-sm border border-grey-c200 overflow-hidden hover:shadow-md transition-shadow">

              <div className="p-5">
                {/* Order Header */}
                <div className={""}>
                  <div className={"flex justify-between items-center"}>
                    <div className="mb-3 pb-2 flex items-center justify-start gap-2">
                      <h3 className="font-semibold text-lg text-primary-c900 flex items-center gap-2">
                        <StorefrontIcon/>
                        {order.shopName}
                      </h3>
                      <button
                        onClick={() => router.push(`/shops/${order.shopId}`)}
                        className={"py-1 px-2 text-xs border border-primary-c600 rounded-lg text-primary-c500 bg-primary-c50"}
                      >

                        Xem Shop
                      </button>
                    </div>
                    <div className={"flex items-center gap-3"}>
                      <Chip
                        label={getLabelStatusColor(order.orderStatus)}
                        color={getStatusColor(order.orderStatus)}

                      />
                      {order.orderStatus === OrderStatus.PAID && (
                        <Chip
                          label="Hủy đơn hàng"
                          onClick={() => handleOpenCancelModal(order.orderId)}
                          color={ChipColor.CANCELLED}
                          icon={<CancelIcon className={"!text-sm"}/>}
                        />
                      )}
                      {order.orderStatus === OrderStatus.COMPLETED && order.updatedAt &&
                        (new Date().getTime() - new Date(order.updatedAt).getTime()) <= 7 * 24 * 60 * 60 * 1000 && (
                          <Chip
                            label="Trả hàng"
                            onClick={() => handleOpenCancelModal(order.orderId, "RETURNED")}
                            color={ChipColor.RETURNED}
                            icon={<AssignmentReturnIcon className={"!text-sm"}/>}
                          />
                        )}
                    </div>
                  </div>
                  {/* Order Items */}
                  <div className="space-y-3 mb-4"
                  onClick={()=> router.push(`/orders/${order.orderId}`)}
                  >
                    {order.orderItems.map((item) => (
                      <div key={item.orderItemId}
                           className="flex gap-4 p-3 bg-grey-c50 rounded-lg hover:bg-grey-c100 cursor-pointer transition-colors">
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-grey-c800 mb-1">{item.productName}</h4>
                          <div className="text-sm text-grey-c600 flex flex-col gap-1">
                            <div className="flex flex-row gap-3">
                              {item.productAttributes.map((productAttribute, index) => (
                                <div key={index} className={"flex flex-row gap-2"}>
                                  <span className="text-grey-c500">{productAttribute.attributeName}:</span>
                                  <span className="font-medium">{productAttribute.attributeValue}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                            <span>Số lượng:
                              <span className="font-medium ml-2">{item.quantity}</span>
                            </span>
                              <span className="text-primary-c800 font-semibold">{formatPrice(item.price)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <Divide/>
                <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-grey-c600 mb-1">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-primary-c800">{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pagination Buttons */}
      <Pagination totalPages={totalPages} currentPage={pageNo} onPageChange={setPageNo}/>
      {/* Cancel Order Modal */}
      {selectedOrderIdToCancel && isCancelModalOpen && (
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        setIsOpen={setIsCancelModalOpen}
        orderId={selectedOrderIdToCancel}
        mutate={mutate}
        actionType={actionType}
      /> )}
    </div>
  )
    ;
};
