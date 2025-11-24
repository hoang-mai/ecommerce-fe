"use client";
import {ReactNode} from "react";
import Modal from "@/libs/Modal";
import Image from "next/image";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import {ProductStatus} from "@/enum";
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import {formatDateTime} from "@/util/FnCommon";

interface ProductImageDTO {
  productImageId: number;
  imageUrl: string;
}

interface ProductAttributeValueDTO {
  attributeValueId: number;
  attributeValue: string;
}

interface ProductAttributeDTO {
  productAttributeId: number;
  attributeName: string;
  attributeValues: ProductAttributeValueDTO[];
}

interface ProductVariantDTO {
  productVariantId: number;
  price: number;
  stockQuantity: number;
  sold: number;
  isDefault: boolean;
  attributeValues: Record<string, string>;
}

interface DetailProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: {
    productId: number;
    shopId: number;
    name: string;
    description: string;
    totalSold: number;
    productStatus: ProductStatus;
    categoryName: string;
    productImages: ProductImageDTO[];
    productAttributes: ProductAttributeDTO[];
    productVariants: ProductVariantDTO[];
    createdAt: string;
    updatedAt: string;
  };
}

export default function DetailProductModal({isOpen, onClose, productData}: DetailProductModalProps) {
  const getStatusColor = (status: ProductStatus): ChipColor => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ProductStatus.INACTIVE:
        return ChipColor.SECONDARY;
      default:
        return ChipColor.SECONDARY;
    }
  };

  const getStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "Đang bán";
      case ProductStatus.INACTIVE:
        return "Ngừng bán";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Chi tiết sản phẩm #${productData.productId}`}
      onClose={onClose}
      showSaveButton={false}
      cancelButtonText={"Đóng"}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Thông tin cơ bản
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-3">
            <InfoRow
              icon={<InventoryRoundedIcon/>}
              label="Tên sản phẩm"
              value={productData.name}
            />
            <InfoRow
              icon={<CategoryRoundedIcon/>}
              label="Danh mục"
              value={productData.categoryName}
            />
            <InfoRow
              icon={<DescriptionRoundedIcon/>}
              label="Mô tả"
              value={productData.description}
            />
            <InfoRow
              icon={<LocalOfferRoundedIcon/>}
              label="Tổng sản phẩm đã bán"
              value={`${productData.totalSold} sản phẩm`}
            />
            <div className="flex items-start gap-3 py-3 border-b border-grey-c200">
              <div className="text-primary-c600 mt-0.5">
                <StyleRoundedIcon/>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-grey-c600 block mb-1">Trạng thái</span>
                <Chip
                  label={getStatusLabel(productData.productStatus)}
                  color={getStatusColor(productData.productStatus)}
                  variant={ChipVariant.SOFT}
                  size={ChipSize.MEDIUM}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hình ảnh sản phẩm */}
        <div>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Hình ảnh sản phẩm
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4">
            <div className="flex items-start gap-3 py-3">
              <div className="text-primary-c600 mt-0.5">
                <ImageRoundedIcon/>
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-grey-c600 block mb-3">
                  Danh sách ảnh ({productData.productImages.length})
                </span>
                {productData.productImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {productData.productImages.map((image, index) => (
                      <div
                        key={image.productImageId}
                        className="relative group rounded-lg overflow-hidden border-2 border-grey-c200 hover:border-primary-c500 transition-all"
                      >
                        <div className="relative w-full h-32">
                          <Image
                            src={image.imageUrl}
                            alt={`${productData.name} - ảnh ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {index === 0 && (
                          <div
                            className="absolute top-2 left-2 bg-primary-c700 text-white text-xs px-2 py-1 rounded-md font-semibold">
                            Ảnh chính
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-base text-grey-c500">Không có ảnh</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Thuộc tính sản phẩm */}
        {productData.productAttributes.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-c700 rounded"></div>
              Thuộc tính sản phẩm
            </h3>
            <div className="bg-grey-c50 rounded-lg p-4 space-y-4">
              {productData.productAttributes.map((attr) => (
                <div key={attr.productAttributeId}
                     className="flex items-start gap-3 py-3 border-b border-grey-c200 last:border-b-0">
                  <div className="text-primary-c600 mt-0.5">
                    <StyleRoundedIcon/>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-grey-c600 block mb-2">
                      {attr.attributeName}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {attr.attributeValues.map((val) => (
                        <Chip
                          key={val.attributeValueId}
                          label={val.attributeValue}
                          color={ChipColor.PRIMARY}
                          variant={ChipVariant.SOFT}
                          size={ChipSize.SMALL}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biến thể sản phẩm */}
        <div>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Biến thể sản phẩm ({productData.productVariants.length})
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4">
            <div className="space-y-4">
              {productData.productVariants.map((variant, index) => (
                <div
                  key={variant.productVariantId}
                  className="bg-white rounded-lg p-4 border-2 border-grey-c200 hover:border-primary-c300 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-grey-c800 flex items-center gap-2">
                      Biến thể {index + 1}
                      {variant.isDefault && (
                        <Chip
                          label="Mặc định"
                          color={ChipColor.SUCCESS}
                          variant={ChipVariant.SOFT}
                          size={ChipSize.SMALL}
                        />
                      )}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      icon={<LocalOfferRoundedIcon/>}
                      label="Giá bán"
                      value={formatPrice(variant.price)}
                    />
                    <InfoRow
                      icon={<InventoryRoundedIcon/>}
                      label="Số lượng tồn kho"
                      value={
                        <span className={`font-bold ${
                          variant.stockQuantity === 0
                            ? 'text-support-c900'
                            : variant.stockQuantity < 20
                              ? 'text-yellow-c900'
                              : 'text-success-c900'
                        }`}>
                          {variant.stockQuantity} sản phẩm
                        </span>
                      }
                    />
                    <InfoRow
                      icon={<InventoryRoundedIcon/>}
                      label="Đã bán"
                      value={`${variant.sold} sản phẩm`}
                    />
                  </div>

                  {/* Attribute Values */}
                  {Object.keys(variant.attributeValues).length > 0 && (
                    <div className="mt-4 pt-4 ">
                      <span className="text-sm font-semibold text-grey-c600 block mb-2">
                        Giá trị thuộc tính:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(variant.attributeValues).map(([key, value]) => (
                          <div
                            key={key}
                            className="px-3 py-1.5 bg-primary-c50 text-primary-c800 rounded-lg text-sm"
                          >
                            <span className="font-semibold">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Thông tin hệ thống
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<CalendarTodayRoundedIcon/>}
                label="Ngày tạo"
                value={formatDateTime(productData.createdAt)}
              />
              <InfoRow
                icon={<CalendarTodayRoundedIcon/>}
                label="Cập nhật lần cuối"
                value={formatDateTime(productData.updatedAt)}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const InfoRow = ({icon, label, value}: { icon?: ReactNode; label: string; value?: string | ReactNode | null }) => (
  <div className="flex items-start gap-3 py-3 border-b border-grey-c200 ">
    {icon && <div className="text-primary-c600 mt-0.5">{icon}</div>}
    <div className="flex-1">
      <span className="text-sm font-semibold text-grey-c600 block mb-1">{label}</span>
      {typeof value === 'string' ? (
        <span className="text-base text-grey-c800">{value || 'Chưa cập nhật'}</span>
      ) : (
        <div className="text-base text-grey-c800">{value || 'Chưa cập nhật'}</div>
      )}
    </div>
  </div>
);
