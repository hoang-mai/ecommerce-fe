import Modal from "@/libs/Modal";
import {formatDate, formatDateTime, formatPrice} from "@/util/FnCommon";
import Calendar from '@mui/icons-material/CalendarMonth';
import User from '@mui/icons-material/Person';
import MapPin from '@mui/icons-material/LocationOn';
import Phone from '@mui/icons-material/Phone';
import CreditCard from '@mui/icons-material/CreditCard';
import Divide from "@/libs/Divide";
import React from "react";
import { InfoRow } from "@/libs/InfoRow";
import {OrderStatus} from "@/type/enum";
import Chip, {ChipColor} from "@/libs/Chip";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedOrder: SelectedOrder;
}

type ProductAttribute = {
  attributeName: string;
  attributeValue: string;
};

type ProductVariant = {
  productAttributes?: ProductAttribute[];
  quantity?: number;
  price?: number;
};

type ProductImage = { imageUrl?: string };

type OrderItem = {
  _id: string;
  productImageList?: ProductImage[];
  productName?: string;
  productVariants?: ProductVariant[];
};

type SelectedOrder = {
  _id?: string;
  orderStatus: OrderStatus;
  paymentId?: string;
  createdAt: string;
  userId?: string;
  receiverName?: string;
  phoneNumber?: string;
  address?: string;
  totalPrice?: number;
  orderItems?: OrderItem[];
};

export default function OrderDetailModal({isOpen, setIsOpen, selectedOrder}: Props) {

  const getLabelStatusColor = (status: OrderStatus) => {
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

  const getStatusColor = (status: OrderStatus) => {
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
  return <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    showSaveButton={false}
    title={`Chi tiết đơn hàng #${selectedOrder?._id}`}
    childrenFooter={
      <div className="p-4">
        <Divide/>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-base font-semibold text-grey-c800">
            <span>Tổng số lượng:</span>
            {/*<span>{totalQuantity}</span>*/}
          </div>
          <div className="flex justify-between text-lg font-bold text-primary-c900">
            <span>Tổng tiền:</span>
            <span>{selectedOrder?.totalPrice != null ? formatPrice(selectedOrder.totalPrice) : 'Chưa cập nhật'}</span>
          </div>
        </div>

      </div>
    }
  >
    <div className="">
      {/* Status & Basic Info */}
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Thông tin đơn hàng
      </h3>
      <div className="bg-grey-c50 rounded-xl p-5 mb-6">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <InfoRow
              label="Trạng thái"
              value={
              <Chip label={getLabelStatusColor(selectedOrder.orderStatus)}
                    color={getStatusColor(selectedOrder.orderStatus)} />
              }
            />
            <InfoRow
              icon={<CreditCard className="w-4 h-4 text-grey-c500" />}
              label="Mã thanh toán"
              value={<span className="font-medium text-grey-c800">{selectedOrder?.paymentId}</span>}
            />
          </div>
          <div>
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-grey-c500" />}
              label="Ngày đặt hàng"
              value={<span className="font-medium text-grey-c800">{formatDateTime(selectedOrder.createdAt)}</span>}
            />
            <InfoRow
              label="Mã người dùng"
              value={<span className="font-medium text-grey-c800">{selectedOrder?.userId}</span>}
            />
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin người nhận
        </h3>
        <div className="bg-grey-c50 rounded-xl p-5 grid grid-cols-2 gap-4">
          <InfoRow
            icon={<User className="w-5 h-5 text-grey-c500 mt-0.5" />}
            label="Tên người nhận"
            value={<span className="font-medium text-grey-c800">{selectedOrder?.receiverName}</span>}
          />
          <InfoRow
            icon={<Phone className="w-5 h-5 text-grey-c500 mt-0.5" />}
            label="Số điện thoại"
            value={<span className="font-medium text-grey-c800">{selectedOrder?.phoneNumber}</span>}
          />
          <InfoRow
            icon={<MapPin className="w-5 h-5 text-grey-c500 mt-0.5" />}
            label="Địa chỉ giao hàng"
            value={<span className="font-medium text-grey-c800">{selectedOrder?.address}</span>}
          />
        </div>
      </div>

      {/* Order Items Detail */}
      <div className="">
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Chi tiết sản phẩm
        </h3>
        <div className="space-y-4">
          {selectedOrder?.orderItems?.map((item: OrderItem) => {
            const imgSrc = item.productImageList?.[0]?.imageUrl;
            const firstVariant = item.productVariants?.[0];
            const price = firstVariant?.price;
            const quantity = firstVariant?.quantity;
            const attributes = firstVariant?.productAttributes;
            return (
              <div key={item._id} className="border border-grey-c200 rounded-xl p-4">
                <div className="flex gap-4">
                  <img
                    src={imgSrc}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-grey-c800 mb-2">{item.productName}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {attributes?.map((attr: ProductAttribute, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-grey-c600">{attr.attributeName}:</span>
                          <span className="font-medium text-grey-c800">{attr.attributeValue}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm text-grey-c600">
                                Số lượng: <span
                                className="font-medium text-grey-c800">{quantity}</span>
                              </span>
                      <span className="text-lg font-bold text-primary-c600">
                                {price != null ? formatPrice(price) : 'Chưa cập nhật'}
                              </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
         </div>
       </div>


     </div>
   </Modal>
 }
