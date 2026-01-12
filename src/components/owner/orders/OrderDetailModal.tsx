'use client';

import React from 'react';
import Modal from '@/libs/Modal';
import Chip from '@/libs/Chip';
import {formatDateTime, formatPrice} from '@/util/fnCommon';
import {getLabelStatusColor, getStatusColor, OrderView} from '@/components/user/orders/Main';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import {OrderStatus} from "@/types/enum";
import HomeIcon from '@mui/icons-material/Home';
import Image from "next/image";
interface Props {
  isOpen: boolean;
  setIsOpen: () => void;
  order: OrderView;
}

export default function OrderDetailModal({isOpen, setIsOpen, order}: Props) {


  return (
    <Modal
      isOpen={isOpen}
      onClose={setIsOpen}
      title={"Thông tin đơn hàng"}
      showSaveButton={false}
      showCancelButton={false}
      maxWidth={"3xl"}
    >
      <div className="grid grid-cols-2 gap-4 p-2 bg-grey-c50 rounded-lg mb-4">

        <div className={"space-x-1"}>
          <span>Mã đơn hàng: </span>
          <span className="font-medium text-grey-c800">
            {order.orderId}
          </span>
        </div>

        <div className={"space-x-1"}>
          <span>Tên cửa hàng:</span>
          <span className="font-medium text-grey-c800">
            {order.shopName}
          </span>
        </div>
        <div className={"space-x-1"}>
          <span>Ngày đặt hàng: </span>
          <span className="font-medium text-grey-c800">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
        <div className={"space-x-1"}>
          <span>Ngày cập nhật: </span>
          <span className="font-medium text-grey-c800">
            {formatDateTime(order.updatedAt)}
          </span>
        </div>
        <div className={"space-x-1"}>
          <span>Số tiền thực nhận: </span>
          <span className="font-medium text-grey-c800">
            {formatPrice(order.totalPrice)}
          </span>
        </div>
        <div>
          <span>Trạng thái đơn hàng: </span>
          <Chip
            label={getLabelStatusColor(order.orderStatus)}
            color={getStatusColor(order.orderStatus)}
          />
        </div>


        {order.orderStatus === OrderStatus.CANCELLED &&
          <div className={"space-x-1"}>
            <span>Lý do hủy: </span>
            <span className="font-medium text-grey-c800">
            {order.reason}
          </span>
          </div>
        }
        {order.orderStatus === OrderStatus.RETURNED &&
          <div className={"space-x-1"}>
            <span>Lý trả hàng: </span>
            <span className="font-medium text-grey-c800">
            {order.reason}
          </span>
          </div>
        }
      </div>
      <div className={"border-2 border-primary-c100 rounded-lg mb-4"}>
        <h3 className="text-lg font-semibold text-primary-c800 flex items-center p-2 gap-2 bg-gradient-to-b from-primary-c100 to-white rounded-t-lg">
          <HomeIcon/>
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

      <div className={"border-2 border-primary-c100 rounded-lg"}>
        <h3 className="text-lg font-semibold text-primary-c800 flex items-center p-2 gap-2 bg-gradient-to-b from-primary-c100 to-white rounded-t-lg">
          <ShoppingBagIcon/>
          Đơn hàng
        </h3>
        <div className="gap-4 p-4 rounded-lg">
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-dashed border-grey-c300">
                <div className="">
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg mr-4"/>
                </div>
                <div className="flex-3 flex flex-col">
                  <div className="font-base">{item.productName}</div>
                  {item.productAttributes && item.productAttributes.length > 0 && (
                    <div
                      className="text-sm text-grey-c600">{item.productAttributes.map(a => `${a.attributeName}: ${a.attributeValue}`).join(', ')}</div>
                  )}
                  <div className="text-sm text-grey-c600 mt-1">Số lượng: {item.quantity}</div>

                  {/* Item-level totals */}
                  <div className="mt-2 text-sm text-grey-c600 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <div>Thành tiền: <span className="font-medium text-grey-c800">{formatPrice(item.totalPrice)}</span>
                    </div>
                    <div>Giảm giá: <span className="font-medium text-grey-c800">{formatPrice(item.totalDiscount)}</span>
                    </div>
                    <div>Thanh toán: <span
                      className="font-semibold text-primary-c900">{formatPrice(item.totalFinalPrice)}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}