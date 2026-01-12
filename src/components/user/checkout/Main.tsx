"use client";
import useSWR from "swr";
import {ADDRESS, CART_VIEW, ORDER_FLASH_SALE} from "@/services/api";
import {useAxiosContext} from "@/components/provider/AxiosProvider";
import {useDispatch} from "react-redux";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AlertType, ColorButton} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Image from "next/image";
import Chip, {ChipColor} from "@/libs/Chip";
import {formatPrice} from "@/util/fnCommon";
import CountdownTimer from "@/libs/CountDownTime";
import {ResInfoAddressDTO} from "@/components/user/profile/AddressModal";
import {useAddressMapping} from "@/hooks/useAddressMapping";
import AddressModal from "@/components/user/profile/AddressModal";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import Button from "@/libs/Button";
import useSWRMutation from "swr/mutation";
import {CartViewDTO, FlashSaleProductView} from "@/types/interface";
import Empty from "@/libs/Empty";
import {useCartData} from "@/components/provider/CartProvider";
import Loading from "@/components/modals/Loading";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {useRouter} from "next/navigation";
import TextField from "@/libs/TextField";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";

interface ResCreateProductOrderItemDTO {
  productId: number;
  discount: number;
  productVariantId: number;
  quantity: number;
  price: number;
  isFlashSale: boolean;
}

interface ResCreateOrderItemDTO {
  shopId: number;
  note?: string;
  productOrderItems: ResCreateProductOrderItemDTO[];
}

interface ResCreateOrderDTO {
  receiverName: string;
  address: string;
  phoneNumber: string;
  items: ResCreateOrderItemDTO[];
}

const cartDefault: CartViewDTO = {cartId: "", cartItems: []};

export default function Main() {
  const router = useRouter();
  const {get, post} = useAxiosContext();
  const dispatch = useDispatch();
  const {mutate} = useCartData();
  const {getFullAddress} = useAddressMapping();

  const fetcher = (url: string) => get<BaseResponse<CartViewDTO>>(url).then(res => res.data);
  const fetcherAddress = (url: string) => get<BaseResponse<ResInfoAddressDTO>>(url).then(res => res.data);
  const fetcherCreateOrder = (url: string, {arg}: { arg: ResCreateOrderDTO }) =>
    post<BaseResponse<never>>(url, arg).then(res => res.data);

  const {data, isLoading, error} = useSWR(CART_VIEW, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const {
    data: dataAddress,
    isLoading: isLoadingAddress,
    error: errorAddress,
    mutate: mutateAddress
  } = useSWR(`${ADDRESS}/default`, fetcherAddress, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const {trigger} = useSWRMutation(ORDER_FLASH_SALE, fetcherCreateOrder);

  // States
  const [isOpenAddressModal, setIsOpenAddressModal] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedCartItems, setSelectedCartItems] = useState<Set<string>>(new Set());
  const [shopNotes, setShopNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const storedSelectedItems = sessionStorage.getItem("selectedCartItems");
    if (storedSelectedItems) {
      try {
        const parsedItems = JSON.parse(storedSelectedItems);
        setTimeout(() => setSelectedCartItems(new Set(parsedItems)), 0);
      } catch (error) {
        console.error("Failed to parse selectedCartItems:", error);
      }
    }
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      const alert: AlertState = {
        isOpen: true,
        message: error.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      };
      dispatch(openAlert(alert));
    }
  }, [dispatch, error, errorAddress]);

  const address = dataAddress?.data;
  const cartData: CartViewDTO = data?.data ?? cartDefault;

  const isFlashSaleValid = useCallback((flashSaleList?: FlashSaleProductView[] | null): boolean => {
    if (!flashSaleList || flashSaleList.length === 0) return false;
    const flashSale = flashSaleList[0];
    const startTime = new Date(flashSale.startTime).getTime();
    const endTime = new Date(flashSale.endTime).getTime();
    return startTime < currentTime && endTime > currentTime && !flashSale.isSoldOut;
  }, [currentTime]);

  const filteredCartData: CartViewDTO = useMemo(() => {
    if (selectedCartItems.size === 0) {
      return cartDefault;
    }

    const filteredCartItems = cartData.cartItems
      .map(item => {
        const filteredProductCartItems = item.productCartItems.filter(pci =>
          selectedCartItems.has(pci.productCartItemId)
        );

        if (filteredProductCartItems.length === 0) {
          return null;
        }

        return {
          ...item,
          productCartItems: filteredProductCartItems,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      cartId: cartData.cartId,
      cartItems: filteredCartItems,
    };
  }, [cartData, selectedCartItems]);

  // Calculate totals
  const totalQuantity = useMemo(() => filteredCartData.cartItems.reduce(
    (sum, item) => sum + item.productCartItems.reduce((s, pci) => {
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return s;
      return s + pci.quantity;
    }, 0),
    0
  ), [filteredCartData]);

  const totalPrice = useMemo(() => filteredCartData.cartItems.reduce((sum, item) => {
    const itemTotal = item.productCartItems.reduce((itemSum, pci) => {
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return itemSum;

      const price = variant.price || 0;

      const flashSaleList = pci.flashSaleProductView;
      const hasValidFlashSale = isFlashSaleValid(flashSaleList);
      const flashSale = flashSaleList?.[0];

      const hasVariantSale = variant.salePrice != null && variant.salePrice < price;

      let discountedPrice = price;
      if (hasValidFlashSale && flashSale) {
        discountedPrice = Math.round(price * (1 - flashSale.discountPercentage / 100));
      } else if (hasVariantSale) {
        discountedPrice = Math.round(variant.salePrice || 0);
      }

      return itemSum + discountedPrice * pci.quantity;
    }, 0);
    return sum + itemTotal;
  }, 0), [filteredCartData, isFlashSaleValid]);

  const handleShopNoteChange = (shopId: string, note: string) => {
    setShopNotes(prev => ({
      ...prev,
      [shopId]: note
    }));
  };

  const handleCreateOrder = async () => {
    if (!address) {
      const alert: AlertState = {
        isOpen: true,
        message: "Vui lòng thêm địa chỉ nhận hàng trước khi thanh toán",
        type: AlertType.ERROR,
        title: "Thiếu địa chỉ nhận hàng",
      };
      dispatch(openAlert(alert));
      return;
    }

    if (filteredCartData.cartItems.length === 0) {
      const alert: AlertState = {
        isOpen: true,
        message: "Vui lòng chọn sản phẩm trước khi thanh toán",
        type: AlertType.ERROR,
        title: "Không có sản phẩm",
      };
      dispatch(openAlert(alert));
      return;
    }

    setIsCreatingOrder(true);

    const orderItems: ResCreateOrderItemDTO[] = filteredCartData.cartItems.map(item => {
      const productOrderItems: ResCreateProductOrderItemDTO[] = item.productCartItems
        .map(pci => {
          const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
          if (!variant) return null;

          const flashSaleList = pci.flashSaleProductView;
          const hasValidFlashSale = isFlashSaleValid(flashSaleList);
          const flashSale = flashSaleList?.[0];

          let activeDiscount = 0;
          if (hasValidFlashSale && flashSale) {
            activeDiscount = flashSale.discountPercentage;
          }

          return {
            productId: Number(pci.productView.productId),
            productVariantId: Number(pci.productVariantId),
            quantity: pci.quantity,
            price: variant.salePrice || variant.price || 0,
            discount: activeDiscount,
            isFlashSale: hasValidFlashSale,
          };
        })
        .filter((x): x is ResCreateProductOrderItemDTO => x !== null);

      return {
        shopId: Number(item.shopView.shopId),
        cartItemId: item.cartItemId,
        note: shopNotes[item.shopView.shopId] || "",
        productOrderItems,
      };
    });

    const reqCreateOrder: ResCreateOrderDTO = {
      receiverName: address.receiverName,
      address: address.detail,
      phoneNumber: address.phoneNumber,
      items: orderItems,
    };

    trigger(reqCreateOrder)
      .then(() => {
        mutate();
        sessionStorage.removeItem("selectedCartItems");
      })
      .catch((err: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          message: err.message || "Đặt hàng thất bại",
          type: AlertType.ERROR,
          title: "Thất bại",
        };
        dispatch(openAlert(alert));
        setIsCreatingOrder(false);
      })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-c50 to-grey-c100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {(isLoading || isLoadingAddress || isCreatingOrder) && <Loading/>}

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-c900 mb-2">Thanh toán đơn hàng</h1>
          <p className="text-grey-c600">Kiểm tra thông tin và xác nhận đơn hàng của bạn</p>
        </div>

        {!isLoading && filteredCartData.cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center justify-center">
            <Empty/>
            <p className="text-grey-c500 text-lg mt-4 mb-6">Không có sản phẩm nào được chọn để thanh toán</p>
            <Button
              onClick={() => router.push("/cart")}
              className="bg-primary-c600 hover:bg-primary-c700 text-white"
            >
              Quay lại giỏ hàng
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Products & Address */}
            <div className="flex-1 space-y-6">
              {/* Delivery Address Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-c600 to-primary-c700 px-5 py-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <LocationOnRoundedIcon/>
                    Địa chỉ nhận hàng
                  </h2>
                </div>
                <div className="p-5">
                  {address ? (
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-lg text-grey-c900">{address.receiverName}</span>
                          {address.isDefault && (
                            <Chip label="Mặc định" color={ChipColor.PRIMARY}/>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-grey-c700">
                          <PhoneRoundedIcon className="text-grey-c500" style={{fontSize: 18}}/>
                          <span>{address.phoneNumber}</span>
                        </div>
                        <div className="flex items-start gap-2 text-grey-c700">
                          <LocationOnRoundedIcon className="text-grey-c500 mt-0.5" style={{fontSize: 18}}/>
                          <span>{getFullAddress(address.detail, address.ward, address.province)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsOpenAddressModal(true)}
                        className="text-primary-c700 hover:text-primary-c900 hover:bg-primary-c50"
                      >
                        Thay đổi
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-grey-c500 mb-4">Bạn chưa có địa chỉ nhận hàng</p>
                      <Button
                        onClick={() => setIsOpenAddressModal(true)}
                        color={ColorButton.PRIMARY}
                      >
                        Thêm địa chỉ
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products by Shop */}
              {filteredCartData.cartItems.map(item => {
                const shopId = item.shopView.shopId;
                return (
                  <div key={item.cartItemId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Shop Header */}
                    <div className="bg-gradient-to-r from-primary-c50 to-primary-c100 px-5 py-4 border-b border-primary-c200">
                      <div className="flex items-center gap-2">
                        <StorefrontIcon className="text-primary-c700"/>
                        <h3 className="font-semibold text-lg text-primary-c900">{item.shopView.shopName}</h3>
                        <Chip label={`${item.productCartItems.length} sản phẩm`} color={ChipColor.PRIMARY}/>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="divide-y divide-grey-c100">
                      {item.productCartItems.map(pci => {
                        const productView = pci.productView;
                        const variant = productView.productVariants.find(v => v.productVariantId === pci.productVariantId) ?? productView.productVariants[0];
                        const price = variant?.price || 0;
                        const isOutOfStock = variant?.stockQuantity === 0;

                        const flashSaleList = pci.flashSaleProductView;
                        const hasFlashSale = isFlashSaleValid(flashSaleList);
                        const flashSale = flashSaleList?.[0];

                        const hasVariantSale = variant?.salePrice != null && variant.salePrice < price;

                        let discountedPrice = price;
                        let activeDiscountPercent = 0;
                        let activeEndDate: string | null = null;
                        let isFlashSaleApplied = false;

                        if (hasFlashSale && flashSale) {
                          discountedPrice = Math.round(price * (1 - flashSale.discountPercentage / 100));
                          activeDiscountPercent = flashSale.discountPercentage;
                          activeEndDate = flashSale.endTime;
                          isFlashSaleApplied = true;
                        } else if (hasVariantSale) {
                          discountedPrice = Math.round(variant.salePrice || 0);
                        }

                        const itemTotal = discountedPrice * pci.quantity;

                        return (
                          <div
                            key={pci.productCartItemId}
                            className={`p-5 ${isOutOfStock ? "opacity-50 bg-grey-c50" : ""}`}
                          >
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-grey-c200">
                                <Image
                                  src={productView.productImages[0]?.imageUrl}
                                  alt={productView.name}
                                  width={96}
                                  height={96}
                                  className="object-cover w-full h-full"
                                />
                                {isOutOfStock && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Chip label="Hết hàng" color={ChipColor.ERROR}/>
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-base text-primary-c900 line-clamp-2 mb-1">
                                  {productView.name}
                                </h4>

                                {/* Variant Attributes */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {productView.productAttributes.map(attr => {
                                    const attrValue = variant?.productVariantAttributeValues.find(
                                      pvav => pvav.productAttributeId === attr.productAttributeId
                                    );
                                    const valueObj = attr.productAttributeValues.find(
                                      v => v.productAttributeValueId === attrValue?.productAttributeValueId
                                    );

                                    return valueObj ? (
                                      <span
                                        key={valueObj.productAttributeValueId}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-grey-c100 rounded text-xs"
                                      >
                                        <span className="text-grey-c600">{attr.productAttributeName}:</span>
                                        <span className="font-medium text-grey-c800">{valueObj.productAttributeValue}</span>
                                      </span>
                                    ) : null;
                                  })}
                                </div>

                                {/* Price & Quantity */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={"text-sm font-medium text-grey-c700"}> Đơn giá:</span>
                                    <span className="text-lg font-bold text-primary-c700">
                                      {formatPrice(discountedPrice)}
                                    </span>
                                    {(hasFlashSale || hasVariantSale) && (
                                       <>
                                         <span className="text-sm text-grey-c400 line-through">
                                           {formatPrice(price)}
                                         </span>
                                         {isFlashSaleApplied &&
                                           <Chip
                                             iconPosition={"end"}
                                             icon={<FlashOnRoundedIcon className=" animate-pulse !text-sm"/>}
                                             label={`-${activeDiscountPercent}%`}
                                             color={ChipColor.ERROR}
                                           />}
                                       </>
                                     )}
                                    <span className="text-grey-c600">x {pci.quantity}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm text-grey-c600">Thành tiền: </span>
                                    <span className="text-lg font-bold text-primary-c900">
                                      {formatPrice(itemTotal)}
                                    </span>
                                  </div>
                                </div>

                                {/* Countdown Timer */}
                                {hasFlashSale && activeEndDate && (
                                  <div className="flex items-center gap-2 mt-2 text-xs text-grey-c600">
                                    <span>{isFlashSaleApplied ? "Flash Sale kết thúc:" : "Giảm giá kết thúc:"}</span>
                                    <CountdownTimer endDate={activeEndDate}/>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shop Note Section */}
                    <div className="px-5 py-4 bg-grey-c50 border-t border-grey-c200">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <TextField
                            label={"Ghi chú cho cửa hàng"}
                            placeholder="Nhập ghi chú cho đơn hàng"
                            value={shopNotes[shopId] || ""}
                            onChange={(e) => handleShopNoteChange(shopId, e)}
                            className="w-full"
                            typeTextField={"textarea"}
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-primary-c900 mb-6">Chi tiết thanh toán</h2>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-grey-c200">
                    <span className="text-grey-c700">Số cửa hàng:</span>
                    <span className="font-semibold text-primary-c900">{filteredCartData.cartItems.length}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-grey-c200">
                    <span className="text-grey-c700">Tổng sản phẩm:</span>
                    <span className="font-semibold text-primary-c900">{selectedCartItems.size}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-grey-c200">
                    <span className="text-grey-c700">Tổng số lượng:</span>
                    <span className="font-semibold text-primary-c900">{totalQuantity}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-grey-c200">
                    <span className="text-grey-c700">Phí vận chuyển:</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-primary-c50 -mx-6 px-6 rounded-lg">
                    <span className="text-lg font-semibold text-primary-c900">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-primary-c700">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateOrder}
                  disabled={filteredCartData.cartItems.length === 0 || !address || isCreatingOrder}
                  color={ColorButton.PRIMARY}
                  fullWidth
                  className="!py-4 text-lg font-semibold"
                >
                  {isCreatingOrder ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </Button>

                <p className="text-xs text-grey-c500 text-center mt-4">
                  Bằng việc đặt hàng, bạn đồng ý với các điều khoản sử dụng của chúng tôi
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Address Modal */}
        {isOpenAddressModal && (
          <AddressModal
            isOpen={isOpenAddressModal}
            setIsOpen={() => setIsOpenAddressModal(false)}
            mutateParent={() => mutateAddress && mutateAddress()}
          />
        )}
      </div>
    </div>
  );
}
