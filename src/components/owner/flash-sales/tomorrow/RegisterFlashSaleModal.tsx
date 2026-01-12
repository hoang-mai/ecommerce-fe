"use client";
import {useState, MouseEvent} from "react";
import {useForm, Controller, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import Modal from "@/libs/Modal";
import TextField from "@/libs/TextField";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {FLASH_SALE_PRODUCT, PRODUCT_VIEW} from "@/services/api";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {useDebounce} from "@/hooks/useDebounce";
import {useBuildUrl} from "@/hooks/useBuildUrl";
import {ProductView, ProductVariant, FlashSale} from "@/types/interface";
import {AlertType, ProductStatus, ProductVariantStatus} from "@/types/enum";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import Image from "next/image";
import {formatPrice} from "@/util/fnCommon";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import Empty from "@/libs/Empty";
import Loading from "@/components/modals/Loading";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
const flashSaleProductSchema = z.object({
  shopId: z.string().min(1, "Vui lòng chọn cửa hàng"),
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  productVariantId: z.string().min(1, "Vui lòng chọn phiên bản sản phẩm"),
  totalQuantity: z
    .number({message: "Tổng số lượng phải là số"})
    .min(1, "Tổng số lượng phải lớn hơn 0"),
  maxQuantityPerUser: z
    .number({message: "Số lượng tối đa phải là số"})
    .min(1, "Số lượng tối đa mỗi người phải lớn hơn 0"),
  discountPercentage: z
    .number({message: "Phần trăm giảm giá phải là số"})
    .min(20,"Phần trăm giảm giá tối thiểu là 20%")
    .max(70,"Phần trăm giảm giá tối đa là 70%")
}).refine(
  (data) => data.maxQuantityPerUser <= data.totalQuantity,
  {
    message: "Số lượng tối đa mỗi người không được lớn hơn tổng số lượng",
    path: ["maxQuantityPerUser"],
  }
);

type FlashSaleProductFormData = z.infer<typeof flashSaleProductSchema>;

interface RegisterFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashSale: FlashSale;
}

interface RegisterFlashSaleRequest {
  shopId: number;
  campaignId: number;
  productId: number;
  productVariantId: number;
  totalQuantity: number;
  maxQuantityPerUser: number;
  rating?: number;
  totalSold?: number;
  discountPercentage: number;
  originalPrice: number;
}

export default function RegisterFlashSaleModal({
                                                 isOpen,
                                                 onClose,
                                                 flashSale,
                                               }: RegisterFlashSaleModalProps) {
  const {get, post} = useAxiosContext();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm<FlashSaleProductFormData>({
    resolver: zodResolver(flashSaleProductSchema),
    defaultValues: {
      shopId: "",
      productId: "",
      productVariantId: "",
      totalQuantity: undefined,
      maxQuantityPerUser: undefined,
      discountPercentage: undefined,
    },
  });

  const watchProductVariantId = useWatch({control, name: "productVariantId"});
  const watchDiscountPercentage = useWatch({control, name: "discountPercentage"});

  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debounce = useDebounce(searchValue, 500);

  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);


  // Fetch products based on selected shop
  const productFetcher = (url: string) =>
    get<BaseResponse<PageResponse<ProductView>>>(url, {isToken: true}).then((res) => res.data);

  const searchUrl = useBuildUrl({
    baseUrl: PRODUCT_VIEW,
    queryParams: {
      keyword: debounce.trim() || undefined,
      pageNo: 0,
      pageSize: 10,
      status: ProductStatus.ACTIVE,
      isOwner: true,
    },
  });

  const {data: searchData, isLoading: isSearching} = useSWR(
    debounce.trim() ? searchUrl : null,
    productFetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  const registerFetcher = (url: string, {arg}: { arg: RegisterFlashSaleRequest }) =>
    post<BaseResponse<never>>(url, arg).then((res) => res.data);

  const {trigger, isMutating} = useSWRMutation(FLASH_SALE_PRODUCT, registerFetcher);

  const shouldShowDropdown =
    isFocused &&
    debounce.trim() &&
    !selectedProduct &&
    ((searchData?.data?.data?.length ?? 0) >= 0 || isSearching);

  const handleSelectProduct = (product: ProductView) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setSearchValue(product.name);
    setIsFocused(false);
    setValue("shopId", product.shopId);
    setValue("productId", product.productId);
    setValue("productVariantId", "");
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setValue("productVariantId", variant.productVariantId);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setSearchValue("");
    setValue("productId", "");
    setValue("productVariantId", "");
  };

  const getAttributeLabel = (variant: ProductVariant): string => {
    if (!selectedProduct) return "";
    const labels: string[] = [];
    variant.productVariantAttributeValues.forEach((attrValue) => {
      const attribute = selectedProduct.productAttributes.find(
        (attr) => attr.productAttributeId === attrValue.productAttributeId
      );
      const value = attribute?.productAttributeValues.find(
        (val) => val.productAttributeValueId === attrValue.productAttributeValueId
      );
      if (attribute && value) {
        labels.push(`${attribute.productAttributeName}: ${value.productAttributeValue}`);
      }
    });
    return labels.join(" | ") || "Mặc định";
  };

  const onSubmit = async (data: FlashSaleProductFormData) => {
    if (selectedVariant && data.totalQuantity > selectedVariant.stockQuantity) {
      dispatch(
        openAlert({
          isOpen: true,
          message: `Tổng số lượng không được vượt quá tồn kho (${selectedVariant.stockQuantity})`,
          type: AlertType.ERROR,
          title: "Lỗi",
        })
      );
      return;
    }

    const request: RegisterFlashSaleRequest = {
      shopId: parseInt(data.shopId),
      campaignId: parseInt(flashSale.flashSaleCampaignId),
      productId: parseInt(data.productId),
      productVariantId: parseInt(data.productVariantId),
      totalQuantity: data.totalQuantity,
      maxQuantityPerUser: data.maxQuantityPerUser,
      rating: selectedProduct?.rating,
      totalSold: selectedVariant?.sold,
      discountPercentage: data.discountPercentage ?? undefined,
      originalPrice: selectedVariant!.price,
    };

    try {
      await trigger(request);
      dispatch(
        openAlert({
          isOpen: true,
          message: "Đăng ký Flash Sale thành công",
          type: AlertType.SUCCESS,
          title: "Thành công",
        })
      );
      onClose();
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      dispatch(
        openAlert({
          isOpen: true,
          message: err.message || "Đăng ký Flash Sale thất bại",
          type: AlertType.ERROR,
          title: "Lỗi",
        })
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Đăng ký Flash Sale: ${flashSale.campaignName}`}
      maxWidth="4xl"
      onSave={handleSubmit(onSubmit)}
      saveButtonText="Đăng ký"
      disableSave={isMutating}
      isLoading={isMutating}
    >
      {(isMutating) && <Loading/>}
      <div className="space-y-6 h-100">

        {/* Product Search Section */}
        <div className="bg-primary-c50 p-4 rounded-xl border border-primary-c200">
          <h3 className="text-base font-bold text-primary-c800 mb-4 flex items-center gap-2">
            <SearchRoundedIcon className="text-primary-c700"/>
            Tìm kiếm sản phẩm
          </h3>

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if (selectedProduct) {
                    handleClearProduct();
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Nhập tên sản phẩm để tìm kiếm..."
                disabled={!!selectedProduct}
                className={`w-full h-12 pl-5 pr-12 text-base bg-white rounded-full 
                    outline-none transition-all duration-200
                    placeholder:text-grey-c400 font-normal
                    ${
                  errors.productId
                    ? "border-2 border-support-c500"
                    : isFocused
                      ? "border-2 border-primary-c600"
                      : "border-2 border-grey-c200 hover:border-primary-c400"
                }
                    ${selectedProduct ? "bg-grey-c50" : ""}`}
              />
              {selectedProduct && (
                <button
                  type="button"
                  onClick={handleClearProduct}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-grey-c200 rounded-full transition-all cursor-pointer"
                >
                  <ClearRoundedIcon className="text-grey-c600"/>
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {shouldShowDropdown && (
              <div
                className="absolute top-full left-0 w-full mt-2 bg-white border-2 border-primary-c500 rounded-2xl shadow-lg z-50 overflow-hidden">
                {isSearching && (
                  <div className="px-5 py-8 flex flex-col items-center justify-center">
                    <div
                      className="w-8 h-8 border-3 border-primary-c200 border-t-primary-c600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-grey-c600 font-medium">Đang tìm kiếm...</p>
                  </div>
                )}

                {!isSearching && searchData?.data?.data && searchData.data.data.length > 0 && (
                  <div className="max-h-[300px] overflow-y-auto">
                    <ul className="py-1">
                      {searchData.data.data.map((product) => (
                        <li
                          key={product.productId}
                          className="transition-all duration-150 hover:bg-primary-c50 bg-white cursor-pointer"
                        >
                          <button
                            type="button"
                            onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
                              e.preventDefault();
                              handleSelectProduct(product);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 text-left cursor-pointer"
                          >
                            {product.productImages[0] ? (
                              <Image
                                src={product.productImages[0].imageUrl}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-lg object-cover border border-grey-c200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-grey-c100 flex items-center justify-center">
                                <InventoryRoundedIcon className="text-grey-c400"/>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-grey-c900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-grey-c600">
                                {product.productVariants.length} phiên bản | Đã bán: {product.totalSold}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary-c700">
                                {formatPrice(
                                  product.productVariants.find((v) => v.isDefault)?.price ||
                                  product.productVariants[0]?.price ||
                                  0
                                )}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isSearching && searchData?.data?.data && searchData.data.data.length === 0 && (
                  <div className="px-5 py-8 flex flex-col items-center justify-center">
                    <Empty/>
                    <p className="text-base font-medium text-grey-c900 mb-1">
                      Không tìm thấy sản phẩm
                    </p>
                    <p className="text-sm text-grey-c600 text-center">
                      Không có sản phẩm nào phù hợp với &quot;
                      <span className="font-medium text-grey-c900">{debounce.trim()}</span>&quot;
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {errors.productId && (
            <p className="text-sm text-support-c900 mt-2 ml-2">{errors.productId.message}</p>
          )}

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-primary-c300">
              <div className="flex items-start gap-4">
                {selectedProduct.productImages[0] ? (
                  <Image
                    src={selectedProduct.productImages[0].imageUrl}
                    alt={selectedProduct.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover border-2 border-primary-c200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-grey-c100 flex items-center justify-center">
                    <InventoryRoundedIcon className="text-grey-c400 !text-3xl"/>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-base font-bold text-grey-c900">{selectedProduct.name}</p>
                  <p className="text-sm text-grey-c600 mt-1">
                    Danh mục: {selectedProduct.categoryName}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-grey-c700 flex items-center gap-1">
                        <StarRateRoundedIcon className={"text-yellow-400"}/> {selectedProduct.rating.toFixed(1)} ({selectedProduct.numberOfRatings} đánh giá)
                      </span>
                    <span className="text-grey-c700">Đã bán: {selectedProduct.totalSold}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Variant Selection */}
        {selectedProduct && (
          <div className="bg-primary-c50 p-4 rounded-xl border border-primary-c200">
            <h3 className="text-base font-bold text-primary-c700 mb-4 flex items-center gap-2">
              <InventoryRoundedIcon className="text-primary-c700"/>
              Chọn phiên bản sản phẩm
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedProduct.productVariants
                .filter((v) => v.productVariantStatus === ProductVariantStatus.ACTIVE)
                .map((variant) => {
                  const isSelected = watchProductVariantId === variant.productVariantId;
                  return (
                    <button
                      key={variant.productVariantId}
                      type="button"
                      onClick={() => handleSelectVariant(variant)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                        isSelected
                          ? "border-primary-c600 bg-primary-c50 shadow-md"
                          : "border-grey-c200 bg-white hover:border-primary-c400 hover:bg-primary-c50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-grey-c900">
                            {getAttributeLabel(variant)}
                          </p>
                          <p className="text-base font-bold text-primary-c700 mt-1">
                            {formatPrice(variant.price)}
                          </p>
                          <p className="text-xs text-grey-c600 mt-1">
                            Tồn kho: {variant.stockQuantity} | Đã bán: {variant.sold}
                          </p>
                        </div>
                        {isSelected && <CheckCircleRoundedIcon className="text-primary-c700 !text-2xl"/>}
                      </div>
                    </button>
                  );
                })}
            </div>

            {errors.productVariantId && (
              <p className="text-sm text-support-c900 mt-2 ml-2">{errors.productVariantId.message}</p>
            )}

            {selectedProduct.productVariants.filter(
              (v) => v.productVariantStatus === ProductVariantStatus.ACTIVE
            ).length === 0 && (
              <p className="text-sm text-grey-c600 text-center py-4">
                Không có phiên bản nào đang hoạt động
              </p>
            )}
          </div>
        )}

        {/* Flash Sale Configuration */}
        {selectedVariant && (
          <div className="bg-primary-c50 p-4 rounded-xl border border-primary-c200">
            <h3 className="text-base font-bold text-primary-c700 mb-4">Cấu hình Flash Sale</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Controller
                name="totalQuantity"
                control={control}
                render={({field}) => (
                  <TextField
                    label="Tổng số lượng"
                    placeholder="Nhập tổng số lượng"
                    type="number"
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    error={errors.totalQuantity?.message}
                    required
                  />
                )}
              />

              <Controller
                name="maxQuantityPerUser"
                control={control}
                render={({field}) => (
                  <TextField
                    label="Số lượng tối đa mỗi người"
                    placeholder="Nhập số lượng tối đa"
                    type="number"
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    error={errors.maxQuantityPerUser?.message}
                    required
                  />
                )}
              />

              <Controller
                name="discountPercentage"
                control={control}
                render={({field}) => (
                  <TextField
                    label="Phần trăm giảm giá (%)"
                    placeholder="Nhập % giảm giá"
                    type="number"
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value ? parseFloat(value) : null)}
                    error={errors.discountPercentage?.message}
                    required
                  />
                )}
              />

              {/* Display calculated discount price */}
              {watchDiscountPercentage && watchDiscountPercentage > 0 && (
                <div className="flex flex-col justify-center">
                  <p className="text-sm text-grey-c600">Giá sau giảm:</p>
                  <p className="text-lg font-bold text-support-c900">
                    {formatPrice(selectedVariant.price * (1 - watchDiscountPercentage / 100))}
                  </p>
                  <p className="text-xs text-grey-c500 line-through">
                    {formatPrice(selectedVariant.price)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Warning Note */}
        <div className="flex items-center gap-3 p-4 bg-support-c100 border border-support-c300 rounded-xl justify-start">
          <WarningRoundedIcon className={"text-yellow-c700"}/>
          <p className="text-sm text-support-c900 font-medium">
            <strong>Lưu ý:</strong> Sau khi đăng ký sẽ không thể hủy hoặc thay đổi sản phẩm đã đăng ký trong thời gian diễn ra Flash Sale.
          </p>
        </div>
      </div>
    </Modal>
  );
}

