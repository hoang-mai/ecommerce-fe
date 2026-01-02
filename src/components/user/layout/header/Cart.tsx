import Modal from "@/libs/Modal";
import Image from "next/image";
import React, {useEffect, useMemo, useState} from "react";
import {formatDate, formatPrice} from "@/util/fnCommon";
import Button from "@/libs/Button";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import { useAxiosContext } from '@/components/provider/AxiosProvider';
import {CART, CART_VIEW} from "@/services/api";
import useSWR from "swr";
import {useDispatch} from "react-redux";
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import Loading from "@/components/modals/Loading";
import Chip, {ChipColor} from "@/libs/Chip";
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import useSWRMutation from "swr/mutation";
import CountdownTimer from "@/libs/CountDownTime";
import {useCartData} from "@/components/provider/CartProvider";
import {useRouter} from "next/navigation";
import {CartViewDTO} from "@/types/interface";
import Divide from "@/libs/Divide";
import Empty from "@/libs/Empty";
import {useDebounce} from "@/hooks/useDebounce";


type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Cart({isOpen, setIsOpen}: Props) {
  const router = useRouter();
  const { get, del, patch } = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<CartViewDTO>>(url).then(res => res.data);
  const fetcherDeleteProductCartItem = (url: string, {arg}: { arg: { productCartItemId: string } }) =>
    del<BaseResponse<never>>(`${url}/${arg.productCartItemId}`).then(res => res.data);
  const fetcherDeleteAll = (url: string) =>
    del<BaseResponse<never>>(url).then(res => res.data);
  const fetcherUpdateProductCartItemQuantity = (url: string, {arg}: {
    arg: { productCartItemId: string, quantity: number }
  }) =>
    patch<BaseResponse<never>>(`${url}/${arg.productCartItemId}`, {quantity: arg.quantity}).then(res => res.data);

  const {data, isLoading, error, mutate: mutateCartView} = useSWR(CART_VIEW, fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });
  const {mutate} = useCartData();
  const {trigger} = useSWRMutation(CART, fetcherDeleteProductCartItem);
  const {trigger: triggerDeleteAll} = useSWRMutation(CART, fetcherDeleteAll)
  const {trigger: triggerUpdateProductCartItemQuantity} = useSWRMutation(CART, fetcherUpdateProductCartItemQuantity);
  const dispatch = useDispatch();
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
  }, [dispatch, error]);
  const [cartData, setCartData] = useState<CartViewDTO>({
    cartId: "",
    cartItems: []
  })
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, number>>({});
  const debouncedPendingUpdates = useDebounce(pendingUpdates, 500);

  useEffect(() => {
    if (data && data.data) {
      setTimeout(() => {
        setCartData(data.data as CartViewDTO);
      }, 0);
    } else {
      setTimeout(() => {
        setCartData({cartId: "", cartItems: []});
      }, 0);
    }
  }, [data]);

  useEffect(() => {
    if (Object.keys(debouncedPendingUpdates).length === 0) return;

    Object.entries(debouncedPendingUpdates).forEach(([productCartItemId, quantity]) => {
      triggerUpdateProductCartItemQuantity({productCartItemId, quantity})
        .then(() => {
          mutate();
          mutateCartView();
        })
        .catch((err: ErrorResponse) => {
          const alert: AlertState = {
            isOpen: true,
            title: "Thất bại",
            message: err.message || "Cập nhật số lượng thất bại",
            type: AlertType.ERROR,
          }
          dispatch(openAlert(alert));
        });
    });
    setTimeout(()=>{
      setPendingUpdates({});
    },0);
  }, [debouncedPendingUpdates, triggerUpdateProductCartItemQuantity, mutate, mutateCartView, dispatch]);

  const handleChangeQuantity = (cartItemId: string, productCartItemId: string, delta: number) => {
    setCartData(prev => {
      const newCartItems = prev.cartItems.map(item => {
        if (item.cartItemId !== cartItemId) return item;
        return {
          ...item,
          productCartItems: item.productCartItems.map(pci => {
            if (pci.productCartItemId !== productCartItemId) return pci;
            // Lấy stockQuantity từ variant
            const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
            const maxQty = variant?.stockQuantity || 99;
            const newQty = Math.max(1, Math.min(pci.quantity + delta, maxQty));

            setPendingUpdates(prev => ({
              ...prev,
              [productCartItemId]: newQty
            }));

            return {...pci, quantity: newQty};
          })
        };
      });
      return {...prev, cartItems: newCartItems};
    });
  };

  const handleDelete = (productCartItemId: string) => {
    trigger({productCartItemId}).then(() => {
      mutate();
      mutateCartView();
    }).catch((err: ErrorResponse) => {
      const alert: AlertState = {
        isOpen: true,
        title: "Thất bại",
        message: err.message || "Xóa sản phẩm khỏi giỏ hàng thất bại",
        type: AlertType.ERROR,
      }
      dispatch(openAlert(alert));
    })
  };

  const handleDeleteAll = () => {
    if (cartData.cartItems.length === 0) return;
    triggerDeleteAll().then((res) => {
      mutate();
      mutateCartView();
      dispatch(openAlert({
        isOpen: true,
        title: "Thành công",
        message: res.message,
        type: AlertType.SUCCESS,
      }));
    }).catch((err: ErrorResponse) => {
      dispatch(openAlert({
        isOpen: true,
        title: "Thất bại",
        message: err.message || "Xóa tất cả sản phẩm khỏi giỏ hàng thất bại",
        type: AlertType.ERROR,
      }));
    })
  };

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
      const discount = pci.productView.discount || 0;
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return itemSum;
      const price = variant.price || 0;
      const discountedPrice = Math.round(price * (1 - discount / 100));
      return itemSum + discountedPrice * pci.quantity;
    }, 0);
    return sum + itemTotal;
  }, 0), [cartData]);


  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={"Giỏ hàng"}
      saveButtonText={"Đặt hàng"}
      cancelButtonText={"Đóng"}
      childrenHeader={
        <div className={"p-4 pb-0"}>
          {cartData.cartItems.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleDeleteAll}
                className="cursor-pointer flex items-center gap-1 text-support-c700 hover:text-support-c900 transition"
              >
                <DeleteOutlineRoundedIcon/> Xóa tất cả
              </button>
            </div>
          )}
        </div>
      }
      childrenFooter={
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
          </div>

        </div>
      }
      onSave={() => {
        router.push("/checkout")
        setIsOpen(false);
      }}
      disableSave={cartData.cartItems.length == 0}
    >
      {isLoading && <Loading/>}
      <div className="space-y-4">
        {cartData.cartItems.length > 0 ? cartData.cartItems.map(item => {
            // Group by shop
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
                    const discount = productView.discount;
                    const hasDiscount = !!(discount && productView.discountEndDate && productView.discountStartDate);
                    const variant = productView.productVariants.find(v => v.productVariantId === pci.productVariantId) ?? productView.productVariants[0];
                    const price = variant?.price || 0;
                    const discountedPrice = hasDiscount ? Math.round(price * (1 - discount / 100)) : price;
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

                            {/* Quantity controls */}
                            <div className="flex flex-row items-center">
                              <span className="text-gray-700">Số lượng:</span>
                              <span className="flex gap-2 ml-1">
                                <Button
                                  onClick={() =>
                                    handleChangeQuantity(item.cartItemId, pci.productCartItemId, -1)
                                  }
                                  disabled={pci.quantity <= 1 || variant?.stockQuantity === 0}
                                  className="rounded-full !p-0 !border-2 border-primary-c600 bg-primary-c100 text-primary-c800 disabled:border-grey-c300"
                                  startIcon={<KeyboardArrowLeftRoundedIcon/>}
                                />

                                <span
                                  className={`font-medium w-6 text-center items-center flex justify-center ${variant?.stockQuantity === 0 ? "text-grey-c600" : "text-primary-c900"}`}>
                                  {pci.quantity}
                                </span>

                                <Button
                                  onClick={() =>
                                    handleChangeQuantity(item.cartItemId, pci.productCartItemId, 1)
                                  }
                                  disabled={pci.quantity >= (variant?.stockQuantity || 99) || variant?.stockQuantity === 0}
                                  className="rounded-full !p-0 !border-2 border-primary-c600 bg-primary-c100 text-primary-c800 disabled:border-grey-c300"
                                  startIcon={<KeyboardArrowRightRoundedIcon/>}
                                />
                                {variant?.stockQuantity === 0 && <Chip label={"Hết hàng"} color={ChipColor.ERROR}/>}
                              </span>
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

                        {/* Delete button */}
                        <div className="flex flex-col gap-2 items-center ml-2">
                          <button
                            className="p-2 rounded bg-support-c300 hover:bg-support-c400 transition cursor-pointer"
                            title="Xóa sản phẩm"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDelete(pci.productCartItemId);
                            }}
                          >
                            <DeleteOutlineRoundedIcon className={"text-support-c700"}/>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
          :
          <div className={"items-center flex flex-col justify-center text-grey-c500"}>
            <Empty/>
            Giỏ hàng của bạn đang trống.
          </div>
        }
      </div>
    </Modal>
  )
    ;
}
