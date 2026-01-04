'use client';
import Image from "next/image";
import React, {useEffect, useMemo, useState} from "react";
import {formatPrice} from "@/util/fnCommon";
import Button from "@/libs/Button";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
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
import Empty from "@/libs/Empty";
import {useDebounce} from "@/hooks/useDebounce";
import CheckBox from "@/libs/CheckBox";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function Main() {
  const router = useRouter();
  const {get, del, patch} = useAxiosContext();
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
    setTimeout(() => {
      setPendingUpdates({});
    }, 0);
  }, [debouncedPendingUpdates, triggerUpdateProductCartItemQuantity, mutate, mutateCartView, dispatch]);

  const handleChangeQuantity = (cartItemId: string, productCartItemId: string, delta: number) => {
    let updatedQuantity = 0;

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

            updatedQuantity = newQty;

            return {...pci, quantity: newQty};
          })
        };
      });
      return {...prev, cartItems: newCartItems};
    });

    // Cập nhật pendingUpdates sau khi setCartData hoàn thành
    setPendingUpdates(prev => ({
      ...prev,
      [productCartItemId]: updatedQuantity
    }));
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

  const handleToggleItem = (productCartItemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productCartItemId)) {
        newSet.delete(productCartItemId);
      } else {
        newSet.add(productCartItemId);
      }
      return newSet;
    });
  };

  const handleSelectAllByShop = (cartItemId: string) => {
    const shopItem = cartData.cartItems.find(item => item.cartItemId === cartItemId);
    if (!shopItem) return;

    const shopProductCartItemIds = shopItem.productCartItems.map(pci => pci.productCartItemId);
    const allShopItemsSelected = shopProductCartItemIds.every(id => selectedItems.has(id));

    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (allShopItemsSelected) {
        // Deselect all items in this shop
        shopProductCartItemIds.forEach(id => newSet.delete(id));
      } else {
        // Select all items in this shop
        shopProductCartItemIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const isShopAllItemsSelected = (cartItemId: string) => {
    const shopItem = cartData.cartItems.find(item => item.cartItemId === cartItemId);
    if (!shopItem || shopItem.productCartItems.length === 0) return false;

    const shopProductCartItemIds = shopItem.productCartItems.map(pci => pci.productCartItemId);
    return shopProductCartItemIds.every(id => selectedItems.has(id));
  };

  const isDiscountValid = (discountStartDate?: string | null, discountEndDate?: string | null): boolean => {
    if (!discountStartDate || !discountEndDate) return false;
    const now = new Date();
    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);
    return now >= startDate && now <= endDate;
  };

  const totalQuantity = useMemo(() => cartData.cartItems.reduce(
    (sum, item) => sum + item.productCartItems.reduce((s, pci) => {
      if (!selectedItems.has(pci.productCartItemId)) return s;
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return s;
      return s + pci.quantity;
    }, 0),
    0
  ), [cartData, selectedItems]);

  const totalPrice = useMemo(() => cartData.cartItems.reduce((sum, item) => {
    const itemTotal = item.productCartItems.reduce((itemSum, pci) => {
      if (!selectedItems.has(pci.productCartItemId)) return itemSum;
      const discount = pci.productView.discount || 0;
      const variant = pci.productView.productVariants.find(v => v.productVariantId === pci.productVariantId);
      if (!variant || variant.stockQuantity === 0) return itemSum;
      const price = variant.price || 0;
      const hasValidDiscount = discount > 0 && isDiscountValid(pci.productView.discountStartDate, pci.productView.discountEndDate);
      const discountedPrice = hasValidDiscount ? Math.round(price * (1 - discount / 100)) : price;
      return itemSum + discountedPrice * pci.quantity;
    }, 0);
    return sum + itemTotal;
  }, 0), [cartData, selectedItems]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-grey-c50 to-grey-c100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary-c900 mb-2">Giỏ hàng của bạn</h1>
        </div>

        {isLoading && <Loading/>}

        {!isLoading && cartData.cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
            <Empty/>
            <p className="text-grey-c500 text-lg mt-4 mb-6">Giỏ hàng của bạn đang trống</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary-c600 hover:bg-primary-c700 text-white"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Cart Items Section */}
            <div className="flex-1 space-y-4">
              {/* Cart Items by Shop */}
              {cartData.cartItems.map(item => (
                <div key={item.cartItemId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Shop Header */}
                  <div
                    className="bg-gradient-to-r from-primary-c50 to-primary-c100 px-5 py-4 border-b border-primary-c200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-primary-c900 flex items-center gap-2">
                        <StorefrontIcon/>
                        <span>{item.shopView.shopName}</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <CheckBox
                          checked={isShopAllItemsSelected(item.cartItemId)}
                          onChange={() => handleSelectAllByShop(item.cartItemId)}
                        />
                        <span className="text-sm font-medium text-primary-c900">
                          Chọn tất cả ({item.productCartItems.length})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="divide-y divide-grey-c200">
                    {item.productCartItems.map(pci => {
                      const productView = pci.productView;
                      const discount = productView.discount;
                      const hasDiscount = !!(discount && productView.discountEndDate && productView.discountStartDate && isDiscountValid(productView.discountStartDate, productView.discountEndDate));
                      const variant = productView.productVariants.find(v => v.productVariantId === pci.productVariantId) ?? productView.productVariants[0];
                      const price = variant?.price || 0;
                      const discountedPrice = hasDiscount ? Math.round(price * (1 - discount / 100)) : price;
                      const itemTotal = discountedPrice * pci.quantity;
                      const isOutOfStock = variant?.stockQuantity === 0;

                      return (
                        <div
                          key={pci.productCartItemId}
                          className={`p-5 hover:bg-grey-c50 transition-colors duration-200 ${isOutOfStock ? 'opacity-60' : ''}`}
                        >
                          <div className="flex gap-4">
                            {/* Checkbox */}
                            <div className="flex items-start pt-2">
                              <CheckBox
                                checked={selectedItems.has(pci.productCartItemId)}
                                onChange={() => handleToggleItem(pci.productCartItemId)}
                                disabled={isOutOfStock}
                              />
                            </div>

                            {/* Product Image */}
                            <div
                              className="relative w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden border-2 border-grey-c200">
                              <Image
                                src={productView.productImages[0]?.imageUrl}
                                alt={productView.name}
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                              />
                              {isOutOfStock && (
                                <div
                                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <Chip label="Hết hàng" color={ChipColor.ERROR}/>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-primary-c900 mb-1 line-clamp-2">
                                    {productView.name}
                                  </h4>
                                  <p className="text-sm text-grey-c600 line-clamp-2 mb-3">
                                    {productView.description}
                                  </p>

                                  {/* Variant Attributes */}
                                  <div className="flex flex-wrap gap-2 mb-3">
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
                                          className="inline-flex items-center gap-1 px-3 py-1 bg-grey-c100 rounded-full text-sm"
                                        >
                                          <span className="text-grey-c700">{attr.productAttributeName}:</span>
                                          <span
                                            className="font-medium text-grey-c900">{valueObj.productAttributeValue}</span>
                                        </span>
                                      ) : null;
                                    })}
                                  </div>

                                  {/* Price Display */}
                                  <div className="flex items-baseline gap-2 mb-3">
                                    Đơn giá:
                                    <span className="text-xl font-bold text-primary-c700">
                                      {formatPrice(discountedPrice)}
                                    </span>
                                    {hasDiscount && (
                                      <>
                                        <span className="text-sm text-grey-c400 line-through">
                                          {formatPrice(price)}
                                        </span>
                                        <Chip
                                          label={`-${discount}%`}
                                          color={ChipColor.SUCCESS}
                                        />
                                      </>
                                    )}
                                  </div>

                                  {/* Discount Timer */}
                                  {hasDiscount && productView.discountEndDate && (
                                    <div className="flex items-center gap-2 mb-3 text-sm">
                                      <CountdownTimer endDate={productView.discountEndDate}/>
                                    </div>
                                  )}

                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-grey-c700">Số lượng:</span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() => handleChangeQuantity(item.cartItemId, pci.productCartItemId, -1)}
                                        disabled={pci.quantity <= 1 || isOutOfStock}
                                        className="!w-8 !h-8 !min-w-0 !p-0 rounded-lg border-2 border-primary-c600 bg-white text-primary-c600 hover:bg-primary-c50 disabled:!border-grey-c300"
                                        startIcon={<KeyboardArrowLeftRoundedIcon/>}
                                      />
                                      <span className="w-12 text-center font-semibold text-lg text-primary-c900">
                                        {pci.quantity}
                                      </span>
                                      <Button
                                        onClick={() => handleChangeQuantity(item.cartItemId, pci.productCartItemId, 1)}
                                        disabled={pci.quantity >= (variant?.stockQuantity || 99) || isOutOfStock}
                                        className="!w-8 !h-8 !min-w-0 !p-0 rounded-lg border-2 border-primary-c600 bg-white text-primary-c600 hover:bg-primary-c50 disabled:!border-grey-c300"
                                        startIcon={<KeyboardArrowRightRoundedIcon/>}
                                      />
                                    </div>
                                    {variant?.stockQuantity && variant.stockQuantity < 10 && variant.stockQuantity > 0 && (
                                      <span className="text-xs text-support-c700">
                                        Chỉ còn {variant.stockQuantity} sản phẩm
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Item Total & Delete */}
                                <div className="flex flex-col items-end justify-between">
                                  <button
                                    onClick={() => handleDelete(pci.productCartItemId)}
                                    className="p-2 rounded-lg text-support-c700 hover:bg-support-c200 hover:text-support-c900 transition-colors cursor-pointer"
                                    title="Xóa sản phẩm"
                                  >
                                    <DeleteOutlineRoundedIcon/>
                                  </button>
                                  <div className="text-right">
                                    <div className="text-xs text-grey-c600 mb-1">Thành tiền</div>
                                    <div className="text-xl font-bold text-primary-c900">
                                      {formatPrice(itemTotal)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-96">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-c900">Thông tin đơn hàng</h2>
                  <button
                    onClick={handleDeleteAll}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-support-c700 hover:bg-support-c50 hover:text-support-c900 transition-all duration-200 text-sm"
                    title="Xóa tất cả sản phẩm"
                  >
                    <DeleteOutlineRoundedIcon fontSize="small"/>
                    <span className="font-medium">Xóa tất cả</span>
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-grey-c200">
                    <span className="text-grey-c700">Số sản phẩm đã chọn:</span>
                    <span className="font-semibold text-primary-c900 text-lg">{selectedItems.size}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-grey-c200">
                    <span className="text-grey-c700">Tổng số lượng:</span>
                    <span className="font-semibold text-primary-c900 text-lg">{totalQuantity}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-primary-c50 -mx-6 px-6 rounded-lg">
                    <span className="text-lg font-semibold text-primary-c900">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-primary-c700">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    router.push("/checkout")
                    sessionStorage.setItem("selectedCartItems", JSON.stringify(Array.from(selectedItems)));
                  }}
                  disabled={selectedItems.size === 0}
                  className="w-full py-4 text-lg font-semibold bg-primary-c600 hover:bg-primary-c700 text-white disabled:bg-grey-c300 disabled:text-grey-c600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                 Đặt hàng
                </Button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

