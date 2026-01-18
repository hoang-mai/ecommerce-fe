import React from "react";
import { ProductView, ProductVariant } from "@/types/interface";
import { formatPrice, formatDateTime } from "@/util/fnCommon";
import InfoRow from "@/libs/InfoRow";
import Image from "next/image";
import LabelRoundedIcon from '@mui/icons-material/LabelRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ToggleOnRoundedIcon from '@mui/icons-material/ToggleOnRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import UpdateRoundedIcon from '@mui/icons-material/UpdateRounded';
import { ProductStatus, ProductVariantStatus } from "@/types/enum";
import Chip, { ChipColor, ChipSize, ChipVariant } from "@/libs/Chip";
import Table from "@/libs/Table";
import ImagePreview from "@/libs/ImagePreview";

type Props = {
  product: ProductView;
  productId: string;
  mutate: () => void;
}

export default function General({ product }: Props) {
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  // Use the product's default variant if available, otherwise fall back to the first variant
  const defaultVariant = product.productVariants.find(v => v.isDefault) || product.productVariants[0] || null;

  const getStatusLabel = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return "Đang bán";
      case ProductStatus.INACTIVE:
        return "Ngừng bán";
      case ProductStatus.SUSPENDED:
        return "Cấm bán";
      case ProductStatus.DELETED:
        return "Đã xóa";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ProductStatus): ChipColor => {
    switch (status) {
      case ProductStatus.ACTIVE:
        return ChipColor.SUCCESS;
      case ProductStatus.INACTIVE:
        return ChipColor.WARNING;
      case ProductStatus.SUSPENDED:
        return ChipColor.ERROR;
      case ProductStatus.DELETED:
        return ChipColor.SECONDARY;
      default:
        return ChipColor.SECONDARY;
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

  // prepare columns for variants table
  const variantColumns = [
    {
      key: "productVariantId",
      label: "STT",
      sortable: false,
      render: (row: ProductVariant, index: number) => (
        <span className="text-sm text-grey-c900">{index + 1}</span>
      ),
    },
    {
      key: "price",
      label: "Giá",
      sortable: false,
      render: (row: ProductVariant) => (
        // If salePrice exists and is less than original price, show salePrice prominently and original price struck-through
        row.salePrice != null && row.salePrice < row.price ? (
          <div>
            <div className="text-sm font-semibold text-primary-c800">{formatPrice(row.salePrice)}</div>
            <div className="text-xs text-grey-c600 line-through">{formatPrice(row.price)}</div>
          </div>
        ) : (
          <span className="text-sm font-semibold text-primary-c800">{formatPrice(row.price)}</span>
        )
      ),
    },
    {
      key: "stockQuantity",
      label: "Tồn kho",
      sortable: false,
      render: (row: ProductVariant) => (
        <span className="text-sm font-medium text-grey-c700">{row.stockQuantity}</span>
      ),
    },
    {
      key: "sold",
      label: "Đã bán",
      sortable: false,
      render: (row: ProductVariant) => (
        <span className="text-sm font-medium text-grey-c700">{row.sold}</span>
      ),
    },
    // conditionally include status column
    ...(product.productStatus === ProductStatus.SUSPENDED || product.productStatus === ProductStatus.DELETED ? [] : [
      {
        key: "productVariantStatus",
        label: "Trạng thái",
        sortable: false,
        render: (row: ProductVariant) => (
          <Chip
            label={getVariantStatusLabel(row.productVariantStatus)}
            color={getVariantStatusColor(row.productVariantStatus)}
            variant={ChipVariant.SOFT}
            size={ChipSize.SMALL}
          />
        ),
      }
    ]),
    {
      key: "attributes",
      label: "Thuộc tính",
      sortable: false,
      render: (row: ProductVariant) => (
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
  ];

  return (
    <div className="py-6 space-y-6">
      {/* Thông tin cơ bản */}
      <div className={"flex flex-row gap-6 flex-wrap"}>
        <div className={"flex-1"}>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Thông tin cơ bản
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
            <InfoRow icon={<LabelRoundedIcon />} label="Tên sản phẩm" value={product.name} />
            <InfoRow icon={<CategoryRoundedIcon />} label="Danh mục" value={product.categoryName} />
            <InfoRow icon={<DescriptionRoundedIcon />} label="Mô tả" value={product.description || "Không có mô tả"} />
            <InfoRow icon={<ToggleOnRoundedIcon />} label="Trạng thái" value={
              <Chip
                label={getStatusLabel(product.productStatus)}
                color={getStatusColor(product.productStatus)}
                variant={ChipVariant.SOFT}
                size={ChipSize.MEDIUM}
              />
            } />
          </div>
        </div>
        <div className={"w-96"}>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Giá và Khuyến mãi
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0 mb-4">
            {defaultVariant ? (
              <>
                <InfoRow
                  icon={<AttachMoneyRoundedIcon />}
                  label={defaultVariant.salePrice != null && defaultVariant.salePrice < defaultVariant.price ? "Giá bán" : "Giá"}
                  value={
                    defaultVariant.salePrice != null && defaultVariant.salePrice < defaultVariant.price
                      ? `${formatPrice(defaultVariant.salePrice)} `
                      : formatPrice(defaultVariant.price)
                  }
                />
                {defaultVariant.salePrice != null && defaultVariant.salePrice < defaultVariant.price && (
                  <InfoRow
                    icon={<AttachMoneyRoundedIcon />}
                    label="Giá gốc"
                    value={formatPrice(defaultVariant.price)}
                  />
                )}
              </>
            ) : (
              <div className="text-sm text-grey-c600">Không có biến thể để hiển thị giá.</div>
            )}
          </div>
          <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary-c700 rounded"></div>
            Lịch sử
          </h3>
          <div className="bg-grey-c50 rounded-lg p-4 space-y-0">
            <InfoRow icon={<HistoryRoundedIcon />} label="Ngày tạo" value={formatDateTime(product.createdAt)} />
            <InfoRow icon={<UpdateRoundedIcon />} label="Cập nhật lần cuối" value={formatDateTime(product.updatedAt)} />
          </div>
        </div>
      </div>
      {/* Thông tin chi tiết */}
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Thông tin chi tiết sản phẩm
      </h3>
      <div className="bg-grey-c50 rounded-lg p-4">
        {Object.entries(product.productDetails).length === 0 ? (
          <div className="text-center py-8 text-grey-c600">Không có thông tin chi tiết</div>
        ) : (
          <div className="flex flex-col gap-2 divide-y divide-grey-c200">
            {Object.entries(product.productDetails).map(([key, value]) => (
              <div key={key} className="flex flex-row p-2">
                <span className="font-semibold text-grey-c800 w-40 mr-40">{key}:</span>
                <span className="text-grey-c700">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hình ảnh */}
      <h3 className="text-lg font-bold text-grey-c800 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary-c700 rounded"></div>
        Hình ảnh sản phẩm
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {product.productImages.map((image, index) => (
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
        columns={variantColumns}
        data={product.productVariants}
        keyExtractor={(row) => row.productVariantId}
        emptyMessage="Không có biến thể"
      />
      {previewImage && <ImagePreview imageUrl={previewImage} onClose={() => setPreviewImage(null)} />}

    </div>
  );
}
