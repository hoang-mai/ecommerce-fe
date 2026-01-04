'use client';

import React from 'react';
import Modal from '@/libs/Modal';
import Chip from '@/libs/Chip';
import {formatDateTime, formatPrice} from '@/util/fnCommon';
import {getLabelStatusColor, getStatusColor, OrderView} from '@/components/user/orders/Main';
import InfoRow from "@/libs/InfoRow";
import {OrderStatus} from "@/types/enum";

interface Props {
  isOpen: boolean;
  setIsOpen: () => void;
  order: OrderView ;
}

export default function OrderDetailModal({ isOpen, setIsOpen, order }: Props) {


  return (
    <Modal isOpen={isOpen} onClose={setIsOpen} title={`Chi tiết ${order.orderId}`} showSaveButton={false}>
      <div className="p-2">
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin đơn hàng
        </h3>
        <div className="grid grid-cols-2 gap-4 p-4 bg-grey-c50 rounded-lg mb-4">

          <div>
            <InfoRow label={"Mã đơn hàng"} value={order.orderId} />
          </div>

          <div>
            <InfoRow label={"Trạng thái"} value={
              <Chip
                label={getLabelStatusColor(order.orderStatus)}
                color={getStatusColor(order.orderStatus)}
              />
            } />
          </div>

          <div>
            <InfoRow label={"Shop"} value={order.shopName}/>
          </div>

          <div>
            <InfoRow label={"Ngày tạo"} value={formatDateTime(order.createdAt)} />
          </div>
          {order.orderStatus ===OrderStatus.CANCELLED &&
          <InfoRow label={"Lý do hủy"} value={order.reason}/>}
        </div>
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin khách hàng
        </h3>

          <div className="grid grid-cols-2 gap-4 p-4 bg-grey-c50 rounded-lg mb-4 ">
            <InfoRow label={"Khách hàng"} value={order.receiverName} />
            <InfoRow label={"Số điện thoại"} value={order.phoneNumber} />
            <InfoRow label={"Địa chỉ giao hàng"} value={order.address} />
            <InfoRow label={"Ghi chú"} value={order.note || 'Không có'} />
            {order.reason && <InfoRow label={"Lý do hủy"} value={order.reason} />}
          </div>

        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin sản phẩm
        </h3>
        <div className="p-4 border border-grey-c200 rounded-lg">
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:justify-between md:items-center py-2 border-b border-dashed border-grey-c300">
                <div className="flex-1">
                  <div className="font-medium">{item.productName}</div>
                  {item.productVariantId && (
                    <div className="text-sm text-grey-c600">Phiên bản: {item.productVariantId}</div>
                  )}
                  {item.productAttributes && item.productAttributes.length > 0 && (
                    <div className="text-sm text-grey-c600">{item.productAttributes.map(a => `${a.attributeName}: ${a.attributeValue}`).join(', ')}</div>
                  )}
                  <div className="text-sm text-grey-c600 mt-1">SL: {item.quantity}</div>

                  {/* Item-level totals */}
                  <div className="mt-2 text-sm text-grey-c600 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <div>Thành tiền: <span className="font-medium text-grey-c800">{formatPrice(item.totalPrice)}</span></div>
                    <div>Giảm giá: <span className="font-medium text-grey-c800">{formatPrice(item.totalDiscount)}</span></div>
                    <div>Thanh toán: <span className="font-semibold text-primary-c900">{formatPrice(item.totalFinalPrice)}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 flex justify-between items-center">
            <span className="font-semibold text-lg">Tổng cộng:</span>
            <span className="font-bold text-xl text-primary-c700">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}