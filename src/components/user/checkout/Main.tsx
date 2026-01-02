"use client";
import Title from "@/libs/Title"
import useSWR from "swr";
import {ADDRESS, CART_VIEW, ORDER} from "@/services/api";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {useDispatch} from "react-redux";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Image from "next/image";
import Chip, {ChipColor} from "@/libs/Chip";
import {formatDate, formatPrice} from "@/util/fnCommon";
import CountdownTimer from "@/libs/CountDownTime";
import {ResInfoAddressDTO} from "@/components/user/profile/AddressModal";
import {useAddressMapping} from "@/hooks/useAddressMapping";
import AddressModal from "@/components/user/profile/AddressModal";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import Button from "@/libs/Button";
import {ColorButton} from "@/types/enum";
import useSWRMutation from "swr/mutation";
import Divide from "@/libs/Divide";
import {CartViewDTO, ProductView} from "@/types/interface";
import Empty from "@/libs/Empty";
import {useCartData} from "@/components/provider/CartProvider";
import Loading from "@/components/modals/Loading";

interface ResCreateProductOrderItemDTO {
  productId: number;
  discount: number;
  productVariantId: number;
  quantity: number;
  price: number;
}

interface ResCreateOrderItemDTO {
  shopId: number;
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
  const {get, post} = useAxiosContext();
  const fetcherCreateOrder = (url: string, {arg}: {
    arg: ResCreateOrderDTO
  }) => post<BaseResponse<never>>(url, arg).then(res => res.data);
  const fetcher = (url: string) => get<BaseResponse<CartViewDTO>>(url).then(res => res.data);
  const fetcherAddress = (url: string) => get<BaseResponse<ResInfoAddressDTO>>(url).then(res => res.data);
  const {mutate} = useCartData();
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
  })
  const dispatch = useDispatch();
  const [isOpenAddressModal, setIsOpenAddressModal] = useState(false);
  const [currentTime] = useState(() => Date.now());
  const {getFullAddress} = useAddressMapping();
  const {trigger} = useSWRMutation(ORDER, fetcherCreateOrder);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
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
    if (errorAddress) {
      const alert: AlertState = {
        isOpen: true,
        message: errorAddress.message || "Đã có lỗi xảy ra",
        type: AlertType.ERROR,
        title: "Lỗi tải dữ liệu",
      }
      dispatch(openAlert(alert));
    }

  }, [dispatch, error, errorAddress]);

  const address = dataAddress?.data;

  // Function to check if a product's discount is active
  const isDiscountActive = useCallback((productView: ProductView) => {
    if (Number(productView.discount) <= 0) return false;
    if (!productView.discountStartDate || !productView.discountEndDate) return false;

    const startTime = new Date(productView.discountStartDate).getTime();
    const endTime = new Date(productView.discountEndDate).getTime();

    return startTime < currentTime && endTime > currentTime;
  }, [currentTime]);
  const handleCreateOrder = () => {
    if (!address) {
      const alert: AlertState = {
        isOpen: true,
        message: "Vui lòng thêm địa chỉ nhận hàng trước khi thanh toán",
        type: AlertType.ERROR,
        title: "Thiếu địa chỉ nhận hàng",
      }
      dispatch(openAlert(alert));
      return;
    }
    setIsCreatingOrder(true);
    const orderItems: ResCreateOrderItemDTO[] = cartData.cartItems.map(item => {
      const productOrderItems: ResCreateProductOrderItemDTO[] = item.productCartItems
        .map(pci => {
          const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
          if (!variant) return null;
          return {
            productId: Number(pci.productView.productId),
            productVariantId: Number(pci.productVariantId),
            quantity: pci.quantity,
            price: variant.price || 0,
            discount: isDiscountActive(pci.productView) ? (pci.productView.discount || 0) : 0,
          };
        })
        .filter((x): x is ResCreateProductOrderItemDTO => x !== null);

      return {
        shopId: Number(item.shopView.shopId),
        productOrderItems: productOrderItems,
      };
    });

    const reqCreateOrder: ResCreateOrderDTO = {
      receiverName: address.receiverName,
      address: getFullAddress(address.detail, address.ward, address.province),
      phoneNumber: address.phoneNumber,
      items: orderItems,
    };

    trigger(reqCreateOrder)
      .then(() => {
        mutate();
      })
      .catch((err: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          message: err.message || "Đặt hàng thất bại",
          type: AlertType.ERROR,
          title: "Thất bại",
        }
        dispatch(openAlert(alert));
      });
  }

  const cartData: CartViewDTO = data?.data ?? cartDefault;

  const totalQuantity = useMemo(() => cartData.cartItems.reduce(
    (sum, item) => sum + item.productCartItems.reduce((s, pci) => {
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return s;
      return s + pci.quantity;
    }, 0),
    0
  ), [cartData]);
  const totalPrice = useMemo(() => cartData.cartItems.reduce((sum, item) => {
    const itemTotal = item.productCartItems.reduce((itemSum, pci) => {
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return itemSum;

      const price = variant.price || 0;
      const discount = pci.productView.discount || 0;
      const hasDiscount = isDiscountActive(pci.productView);
      const discountedPrice = hasDiscount ? Math.round(price * (100 - discount) / 100) : price;

      return itemSum + discountedPrice * pci.quantity;
    }, 0);
    return sum + itemTotal;
  }, 0), [cartData, isDiscountActive]);
  return <div className="max-w-6xl mx-auto p-4">
    {(isLoading || isLoadingAddress || isCreatingOrder) && <Loading/>}
    <Title title={"Thanh toán & Giao hàng"}/>
    <div className="flex flex-col gap-6 mt-4">
      {cartData.cartItems.length > 0 ? cartData.cartItems.map(item => {
          return (
            <div key={item.cartItemId} className="border border-primary-c400 rounded-lg p-4 bg-white">
              {/* Shop Header */}
              <div className="mb-3 pb-2 border-b border-grey-c300">
                <h3 className="font-semibold text-lg text-primary-c900">
                  🏪 {item.shopView.shopName}
                </h3>
              </div>

              {/* Products in this shop */}
              <div className="space-y-3">
                {item.productCartItems.map(pci => {
                  const productView = pci.productView;
                  const discount = productView.discount ?? 0;
                  const variant = productView.productVariants.find(v => v.productVariantId === pci.productVariantId) ?? productView.productVariants[0];
                  const price = variant?.price || 0;
                  const hasDiscount = isDiscountActive(productView);
                  const discountedPrice = hasDiscount ? Math.round(price * (100 - discount) / 100) : price;
                  const itemTotal = discountedPrice * pci.quantity;

                  return (
                    <div
                      key={pci.productCartItemId}
                      className="flex flex-row gap-4 items-center p-3 border border-primary-c200 rounded-lg transition-shadow duration-200 bg-grey-c50 hover:shadow-md"
                    >
                      <div className="w-24 h-24 flex-shrink-0">
                        <Image
                          src={productView.productImages[0]?.imageUrl}
                          alt={productView.name}
                          width={100}
                          height={100}
                          className="object-cover rounded-md w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <h4 className="font-semibold text-base text-primary-c900">{productView.name}</h4>
                        <p className="truncate max-w-sm text-sm text-gray-700">{productView.description}</p>

                        {/* Variant attributes */}
                        <div className="flex gap-2 text-sm flex-col">
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
                                className="mr-1 text-gray-700 flex flex-row gap-2"
                              >
                                {attr.productAttributeName}:{' '}
                                <span className="font-medium">{valueObj.productAttributeValue}</span>
                              </span>
                            ) : null;
                          })}

                          {/* Quantity */}
                          <div className="flex flex-row items-center">
                            <span className="text-gray-700">Số lượng:</span>
                            <span
                              className={`font-medium w-6 text-center items-center flex justify-center ml-1 ${variant?.stockQuantity === 0 ? "text-grey-c600" : "text-primary-c900"}`}>
                              {pci.quantity}
                            </span>
                            {variant?.stockQuantity === 0 && <Chip label={"Hết hàng"} color={ChipColor.ERROR}/>}
                          </div>

                          {/* Price */}
                          <div className="mt-1">
                            {hasDiscount ? (
                              <span className="text-primary-c900">
                                Giá sau giảm:{' '}
                                <span className="font-medium">
                                  {formatPrice(discountedPrice)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-primary-c900">
                                Giá:{' '}
                                <span className="font-medium">
                                  {formatPrice(price)}
                                </span>
                              </span>
                            )}
                            {hasDiscount && (
                              <span className="text-gray-400 text-xs ml-2">
                                (Giá gốc:{' '}
                                <span className="line-through">{formatPrice(price)}</span>)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-sm font-semibold text-primary-c800">
                          Thành tiền: {formatPrice(itemTotal)}
                        </div>

                        {hasDiscount && productView.discountEndDate && (
                          <div className="flex gap-2 items-center text-xs text-gray-600">
                            <span>Giảm giá đến: {formatDate(productView.discountEndDate)}</span>
                            <CountdownTimer endDate={productView.discountEndDate}/>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })
        :
        <div className={"items-center flex flex-col justify-center text-grey-c500"}>
          <Empty/>
          Giỏ hàng của bạn đang trống.
        </div>
      }
      {address && (
        <div className="mt-6">
          <div className="rounded-lg p-4 bg-white border border-grey-c300 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <LocationOnRoundedIcon className={address.isDefault ? 'text-primary-c700' : 'text-grey-c600'}/>
                <span className="font-semibold text-grey-c800">{address.receiverName}</span>
                {address.isDefault && (
                  <span className="bg-primary-c700 text-white text-xs px-2 py-1 rounded ml-2">Mặc định</span>
                )}
              </div>
              <div className="mt-2 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <PhoneRoundedIcon className="text-grey-c600" style={{fontSize: 18}}/>
                  <span className="text-grey-c700">{address.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LocationOnRoundedIcon className="text-grey-c600" style={{fontSize: 18}}/>
                  <span
                    className="text-grey-c700">{getFullAddress(address.detail, address.ward, address.province)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="cursor-pointer text-primary-c700 hover:text-primary-c900 text-sm font-semibold"
                onClick={() => setIsOpenAddressModal(true)}
              >
                Thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpenAddressModal && (
        <AddressModal
          isOpen={isOpenAddressModal}
          setIsOpen={() => setIsOpenAddressModal(false)}
          mutateParent={() => mutateAddress && mutateAddress()}
        />
      )}
      <div className="p-4">
        <Divide/>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-base font-semibold text-grey-c800">
            <span>Tổng số lượng:</span>
            <span>{totalQuantity}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-primary-c900">
            <span>Tổng tiền:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              color={ColorButton.PRIMARY}
              fullWidth
              className="!py-3"
              disabled={cartData.cartItems.length === 0 || !address}
              onClick={handleCreateOrder}
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
}