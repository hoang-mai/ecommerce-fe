import React, { useEffect, useState } from "react";
import { useAxiosContext } from "@/components/provider/AxiosProvider";
import useSWR from "swr";
import { ORDER_VIEW } from "@/services/api";
import { AlertType, OrderStatus } from "@/types/enum";
import { openAlert } from "@/redux/slice/alertSlice";
import { useDispatch } from "react-redux";
import OrderItemDetailModal from "@/components/user/orders/[id]/OrderItemDetailModal";
import Loading from "@/components/modals/Loading";
import Image from "next/image";
import OrderTimeLine from "@/components/user/orders/[id]/OrderTimeline";
import Title from "@/libs/Title";
import { OrderItem, OrderView } from "../Main";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Divide from "@/libs/Divide";
import { formatDateTime, formatPrice } from "@/util/fnCommon";
import HomeIcon from "@mui/icons-material/Home";
import ReviewsRoundedIcon from '@mui/icons-material/ReviewsRounded';
interface Props {
  id: string;
}

export default function Main({ id }: Props) {
  const { get } = useAxiosContext();
  const dispatch = useDispatch();
  const fetcher = (url: string) =>
    get<BaseResponse<OrderView>>(url).then(res => res.data.data);

  const { data, error, isLoading } = useSWR(`${ORDER_VIEW}/${id}`, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  }
  );
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);

  const openItemModal = (item: OrderItem) => {
    setSelectedOrderItem(item);
    setIsModalOpen(true);
  };

  const closeItemModal = () => {
    setIsModalOpen(false);
    setSelectedOrderItem(null);
  };

  if (!data) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex justify-center items-center h-64">
        <h3 className="text-lg font-semibold">Đơn hàng không tồn tại</h3>
      </div>
    );
  }

  const order = data;
  const subtotal = order.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = order.orderItems.reduce((sum, item) => sum + item.totalDiscount, 0);
  const total = order.orderItems.reduce((sum, item) => sum + item.totalFinalPrice, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      {isLoading && <Loading />}
      <Title title={"Chi tiết đơn hàng"} />
      <OrderTimeLine currentStatus={order.orderStatus} />

      <div className={" border p-4 rounded-lg border-grey-c100 bg-white"}>
        <div className={"flex flex-row gap-2 items-start"}>{order.shopLogoUrl ? (
          <Image
            src={order.shopLogoUrl}
            alt={order.shopName}
            width={48}
            height={48}
            className={"w-12 h-12 object-cover rounded-full mb-2 border border-grey-c300"} />)
          : (
            <div
              className="w-12 h-12 rounded-full border-2 border-primary-c200 bg-primary-c50 flex-shrink-0 flex items-center justify-center">
              <StorefrontIcon className="text-primary-c700" style={{ fontSize: 24 }} />
            </div>
          )}
          <span className={"text-lg font-semibold"}>{order.shopName}</span>
        </div>
        <Divide />
        <div className="space-y-4">
          {order.orderItems && order.orderItems.length > 0 ? (
            order.orderItems.map((item) => (
              <div key={item.orderItemId} className="flex items-center justify-between ">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded" />
                  <div>
                    <div className="font-medium text-grey-c800">{item.productName}</div>
                    {item.productAttributes && item.productAttributes.length > 0 && (
                      <div
                        className="text-sm text-grey-c600">{item.productAttributes.map(a => `${a.attributeName}: ${a.attributeValue}`).join(', ')}</div>
                    )}
                    <span className="text-sm font-medium text-grey-c700 mr-1">Số lượng:</span>
                    <span className="text-center font-semibold text-base text-grey-c800">
                      {item.quantity}
                    </span>

                  </div>

                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right w-50">
                    <div className="text-xl font-bold text-primary-c700">{formatPrice(item.totalFinalPrice)}</div>
                    {item.totalPrice > item.totalFinalPrice && (
                      <div className="text-sm text-grey-c400 line-through">
                        {formatPrice(item.totalPrice)}
                      </div>
                    )}
                  </div>
                  {order.orderStatus === OrderStatus.COMPLETED &&
                    <button
                      className="text-primary-c700 rounded cursor-pointer"
                      onClick={() => openItemModal(item)}
                    >
                      <ReviewsRoundedIcon />
                    </button>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-grey-c600">Không có sản phẩm trong đơn hàng</div>
          )}
        </div>

      </div>
      <div className={"border-2 border-primary-c100 rounded-lg bg-white"}>
        <h3
          className="text-lg font-semibold text-primary-c800 flex items-center p-2 gap-2 bg-gradient-to-b from-primary-c100 to-white rounded-t-lg">
          <HomeIcon />
          Thông tin khách hàng
        </h3>

        <div className="gap-4 p-4 rounded-lg ">
          <div className={"text-lg font-medium"}>{order.receiverName} - {order.phoneNumber}</div>
          <div>{order.address}</div>
          {order.note && (
            <div className="">
              <span className="font-medium">Ghi chú:</span> {order.note}
            </div>
          )}
        </div>
      </div>
      <div className={"border rounded-lg border-grey-c100 bg-white p-4"}>
        <div className={"font-semibold"}> Tổng quan đơn hàng</div>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className={"text-grey-c700"}>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className={"text-grey-c700"}>Giảm giá</span>
            <span>- {formatPrice(totalDiscount)}</span>
          </div>
          <Divide />
          <div className="flex justify-between font-bold text-primary-c900 text-lg">
            <span>Tổng cộng</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      <div className={"border rounded-lg border-grey-c100 bg-white p-4"}>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between">
            <span className={"text-grey-c700"}>Mã đơn hàng:</span>
            <span className="font-medium text-grey-c800">{order.orderCode}</span>
          </div>
          {(order.orderStatus === OrderStatus.CANCELLED || order.orderStatus === OrderStatus.RETURNED) && (
            <div className="flex justify-between">
              <span className={"text-grey-c700"}>Lý do hủy:</span>
              <span className="font-medium text-grey-c800">{order.reason}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className={"text-grey-c700"}>Ngày đặt hàng:</span>
            <span className="font-medium text-grey-c800">{formatDateTime(order.createdAt)}</span>
          </div>

        </div>
      </div>
      {selectedOrderItem && (
        <OrderItemDetailModal
          isOpen={isModalOpen}
          setIsOpen={(open) => {
            if (!open) closeItemModal(); else setIsModalOpen(open);
          }}
          selectedOrderItem={selectedOrderItem}
          orderStatus={order.orderStatus}
          selectedOrder={order} />
      )}

    </div>
  );
}