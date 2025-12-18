
import React from "react";
import {ProductView, ProductVariant} from "@/types/interface";
import {formatPrice, formatDateTime} from "@/util/FnCommon";
import InfoRow from "@/libs/InfoRow";
import Image from "next/image";
import LabelRoundedIcon from '@mui/icons-material/LabelRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import {ProductStatus, ProductVariantStatus} from "@/types/enum";
import Chip, {ChipColor, ChipSize, ChipVariant} from "@/libs/Chip";
import Table from "@/libs/Table";
import ImagePreview from "@/libs/ImagePreview";

type Props = {
  product: ProductView;
  productId: string;
  mutate: () => void;
}

export default function General({product}: Props) {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
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

  const getVariantStatusColor = (status: ProductVariantStatus): ChipColor => {
    switch (status) {
      case ProductVariantStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ProductVariantStatus.INACTIVE:
        return ChipColor.SECONDARY;
      case ProductVariantStatus.OUT_OF_STOCK:
        return ChipColor.WARNING;
      default:
        return ChipColor.SECONDARY;
    }
  };

  const getVariantStatusLabel = (status: ProductVariantStatus) => {
    switch (status) {
      case ProductVariantStatus.ACTIVE:
        return "Đang bán";
      case ProductVariantStatus.INACTIVE:
        return "Ngừng bán";
      case ProductVariantStatus.OUT_OF_STOCK:
        return "Hết hàng";
      default:
        return status;
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Thông tin cơ bản */}
      <div className={"flex flex-row gap-6"}>
        <div className={"flex-1"}>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Thông tin cơ bản
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
            <InfoRow icon={<LabelRoundedIcon/>} label="Tên sản phẩm" value={product.name}/>
            <InfoRow icon={<CategoryRoundedIcon/>} label="Danh mục" value={product.categoryName}/>
            <InfoRow icon={<DescriptionRoundedIcon/>} label="Mô tả" value={product.description || "Không có mô tả"}/>
            <InfoRow icon={<ToggleOnRoundedIcon/>} label="Trạng thái" value={
              <Chip
                label={getStatusLabel(product.productStatus)}
                color={getStatusColor(product.productStatus)}
                variant={ChipVariant.SOFT}
                size={ChipSize.MEDIUM}
              />
            }/>
          </div>
        </div>
        <div className={"w-96"}>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Giá và Khuyến mãi
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0 mb-4">
            <InfoRow
              icon={<AttachMoneyRoundedIcon/>}
              label="Giá gốc"
              value={product.productVariants[0] ? formatPrice(product.productVariants[0].price) : "N/A"}
            />
            <InfoRow
              icon={<LocalOfferRoundedIcon/>}
              label="Giảm giá"
              value={Number(product.discount)>0 ? `${product.discount}%` : "Không có"}
            />
            {Number(product.discount)>0 && (
              <>
                <InfoRow
                  icon={<CalendarTodayRoundedIcon/>}
                  label="Ngày bắt đầu"
                  value={product.discountStartDate ? formatDateTime(product.discountStartDate) : "N/A"}
                />
                <InfoRow
                  icon={<CalendarTodayRoundedIcon/>}
                  label="Ngày kết thúc"
                  value={product.discountEndDate ? formatDateTime(product.discountEndDate) : "N/A"}
                />
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Lịch sử
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
            <InfoRow icon={<HistoryRoundedIcon/>} label="Ngày tạo" value={formatDateTime(product.createdAt)}/>
            <InfoRow icon={<UpdateRoundedIcon/>} label="Cập nhật lần cuối" value={formatDateTime(product.updatedAt)}/>
          </div>
        </div>
      </div>
      {/* Hình ảnh */}
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Hình ảnh sản phẩm
      </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.productImages.map((image,index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPreviewImage(image.imageUrl)}
              className="w-20 h-20 relative rounded-lg overflow-hidden border-2 border-grey-c200 hover:border-blue-400 transition-all transform hover:scale-105"
            >
              <Image
                src={image.imageUrl} 
                alt="Product" 
                fill
                className="object-cover"
              />
            </button>
          ))}
          {product.productImages.length === 0 && (
            <div className="col-span-full text-center py-8 text-grey-c600">
              Không có hình ảnh
            </div>
          )}
        </div>

      {/* Thuộc tính */}
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Thuộc tính
      </h3>
        {product.productAttributes.length === 0 ? (
          <div className="text-center py-8 text-grey-c600">Không có thuộc tính</div>
        ) : (
          <div className="space-y-4">
            {product.productAttributes.map((attr) => (
              <div key={attr.productAttributeId}>
                <h4 className="font-semibold mb-2 text-grey-c800">{attr.productAttributeName}</h4>
                <div className="flex flex-wrap gap-2">
                  {attr.productAttributeValues.map((val) => (
                    <Chip
                      key={val.productAttributeValueId}
                      label={val.productAttributeValue}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      {/* Biến thể */}
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Danh sách biến thể sản phẩm
      </h3>
        <Table<ProductVariant>
          columns={[
            {
              key: "productVariantId",
              label: "ID",
              sortable: false,
              render: (row) => (
                <span className="text-sm text-grey-c900">{row.productVariantId}</span>
              ),
            },
            {
              key: "price",
              label: "Giá",
              sortable: false,
              render: (row) => (
                <span className="text-sm font-semibold text-primary-c800">{formatPrice(row.price)}</span>
              ),
            },
            {
              key: "stockQuantity",
              label: "Kho",
              sortable: false,
              render: (row) => (
                <span className="text-sm font-medium text-grey-c700">{row.stockQuantity}</span>
              ),
            },
            {
              key: "sold",
              label: "Đã bán",
              sortable: false,
              render: (row) => (
                <span className="text-sm font-medium text-grey-c700">{row.sold}</span>
              ),
            },
            {
              key: "productVariantStatus",
              label: "Trạng thái",
              sortable: false,
              render: (row) => (
                <Chip
                  label={getVariantStatusLabel(row.productVariantStatus)}
                  color={getVariantStatusColor(row.productVariantStatus)}
                  variant={ChipVariant.SOFT}
                  size={ChipSize.SMALL}
                />
              ),
            },
            {
              key: "attributes",
              label: "Thuộc tính",
              sortable: false,
              render: (row) => (
                <div className="space-y-1">
                  {row.productVariantAttributeValues.map((av) => {
                    const attr = product.productAttributes.find(
                      (a) => a.productAttributeId === av.productAttributeId
                    );
                    const val = attr?.productAttributeValues.find(
                      (v) => v.productAttributeValueId === av.productAttributeValueId
                    );
                    return (
                      <div key={av.productVariantAttributeValueId} className="text-xs text-grey-c700">
                        <span className="font-semibold">{attr?.productAttributeName}:</span> {val?.productAttributeValue}
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
          data={product.productVariants}
          keyExtractor={(row) => row.productVariantId}
          emptyMessage="Không có biến thể"
        />
      {previewImage && <ImagePreview imageUrl={previewImage} onClose={() => setPreviewImage(null)}/>}

    </div>
  );
}

