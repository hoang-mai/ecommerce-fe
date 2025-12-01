import Modal from "@/libs/Modal";
import {formatPrice} from "@/util/FnCommon";
import Divide from "@/libs/Divide";
import React from "react";
import { InfoRow } from "@/libs/InfoRow";
import {OrderItem} from "@/components/user/orders/Main";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedOrderItem: OrderItem;
}

export default function OrderItemDetailModal({isOpen, setIsOpen, selectedOrderItem}: Props) {
  return <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    showSaveButton={false}
    title={`Chi tiết sản phẩm #${selectedOrderItem.orderItemId}`}
    childrenFooter={
      <div className="p-4">
        <Divide/>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-base font-semibold text-grey-c800">
            <span>Số lượng:</span>
            <span>{selectedOrderItem.quantity}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-grey-c800">
            <span>Giá:</span>
            <span>{formatPrice(selectedOrderItem.price)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-grey-c800">
            <span>Tổng giá:</span>
            <span>{formatPrice(selectedOrderItem.totalPrice)}</span>
          </div>
          {selectedOrderItem.totalDiscount > 0 && (
            <div className="flex justify-between text-base font-semibold text-orange-600">
              <span>Giảm giá:</span>
              <span>-{formatPrice(selectedOrderItem.totalDiscount)}</span>
            </div>
          )}
          <Divide/>
          <div className="flex justify-between text-lg font-bold text-primary-c900">
            <span>Thành tiền:</span>
            <span>{formatPrice(selectedOrderItem.totalFinalPrice)}</span>
          </div>
        </div>
      </div>
    }
  >
    <div className="">
      {/* Product Detail */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Thông tin sản phẩm
        </h3>
        <div className="border border-grey-c200 rounded-xl p-4">
          <div className="flex gap-4">
            <Image
              src={selectedOrderItem.productImageUrl}
              alt={selectedOrderItem.productName}
              width={120}
              height={120}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-grey-c800 text-xl mb-3">{selectedOrderItem.productName}</h4>
              <div className="space-y-2 text-sm">
                <InfoRow
                  label="Mã sản phẩm"
                  value={<span className="font-medium text-grey-c800">{selectedOrderItem.productId}</span>}
                />
                <InfoRow
                  label="Mã biến thể"
                  value={<span className="font-medium text-grey-c800">{selectedOrderItem.productVariantId}</span>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Attributes */}
      {selectedOrderItem.productAttributes && selectedOrderItem.productAttributes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Thuộc tính sản phẩm
          </h3>
          <div className="bg-grey-c50 rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4">
              {selectedOrderItem.productAttributes.map((attr, index) => (
                <InfoRow
                  key={index}
                  label={attr.attributeName}
                  value={<span className="font-semibold text-grey-c800">{attr.attributeValue}</span>}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="">
        <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-primary-c700 rounded"></div>
          Chi tiết giá
        </h3>
        <div className="bg-grey-c50 rounded-xl p-5 space-y-3">
          <div className="flex justify-between text-sm text-grey-c700">
            <span>Đơn giá:</span>
            <span className="font-medium">{formatPrice(selectedOrderItem.price)}</span>
          </div>
          <div className="flex justify-between text-sm text-grey-c700">
            <span>Số lượng:</span>
            <span className="font-medium">x {selectedOrderItem.quantity}</span>
          </div>
          <Divide/>
          <div className="flex justify-between text-base font-semibold text-grey-c800">
            <span>Tạm tính:</span>
            <span>{formatPrice(selectedOrderItem.totalPrice)}</span>
          </div>
          {selectedOrderItem.totalDiscount > 0 && (
            <div className="flex justify-between text-base font-semibold text-orange-600">
              <span>Giảm giá:</span>
              <span>-{formatPrice(selectedOrderItem.totalDiscount)}</span>
            </div>
          )}
          <Divide/>
          <div className="flex justify-between text-lg font-bold text-primary-c900">
            <span>Thành tiền:</span>
            <span>{formatPrice(selectedOrderItem.totalFinalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  </Modal>
}
