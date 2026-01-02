"use client";
import React, {useEffect, useMemo, useState} from "react";
import useSWR from "swr";
import {CART, PRODUCT_VIEW} from "@/services/api";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import Loading from "@/components/modals/Loading";
import {ReqAddToCartDTO} from "@/components/user/ProductCard";
import useSWRMutation from "swr/mutation";
import {useCartData} from "@/components/provider/CartProvider";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType, ColorButton, ProductStatus, ShopStatus} from "@/types/enum";
import Button from "@/libs/Button";
import {ProductVariant, ProductView,} from "@/types/interface";
import ImagePreview from "@/libs/ImagePreview";
import {formatNumber, formatPrice} from "@/util/fnCommon";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import Carousel from "@/libs/Carousel";
import CountdownTimer from "@/libs/CountDownTime";
import Review from "@/components/user/products/[id]/Review";
import Shop from "@/components/user/products/[id]/Shop";
import Star from "@/libs/Star";

const productDefault: ProductView = {
  productId: "",
  shopId: "",
  rating: 0,
  numberOfRatings: 0,
  numberOfReviews: 0,
  ratingStatistics: {
    "FIVE": 0,
    "FOUR": 0,
    "THREE": 0,
    "TWO": 0,
    "ONE": 0
  },
  name: "",
  description: "",
  productStatus: ProductStatus.ACTIVE,
  totalSold: 0,
  discount: 0,
  discountStartDate: null,
  discountEndDate: null,
  categoryId: "",
  categoryName: "",
  shopStatus: ShopStatus.ACTIVE,
  productDetails: {},
  productImages: [],
  productAttributes: [],
  productVariants: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

type Props = {
  id: string
}

export default function Main({id}: Props) {
  const {get, post} = useAxiosContext();
  const fetcher = (url: string) => get<BaseResponse<ProductView>>(url).then(res => res.data);
  const addToCartFetcher = (url: string, {arg}: {
    arg: ReqAddToCartDTO
  }) => post<BaseResponse<never>>(url, arg).then(res => res.data);

  const {data, isLoading, error} = useSWR(`${PRODUCT_VIEW}/${id}`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const product = data?.data ?? productDefault;
  const defaultVariant = useMemo(() =>
    product.productVariants.find(v => v.isDefault) ?? product.productVariants[0], [product.productVariants]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant || null);
  const [quantity, setQuantity] = useState(1);
  const [currentTime] = useState(() => Date.now());
  const {mutate} = useCartData();
  const dispatch = useDispatch();
  const {trigger, isMutating} = useSWRMutation(CART, addToCartFetcher);

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

  const handleAttributeSelect = (productAttributeId: string, productAttributeValueId: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [productAttributeId]: productAttributeValueId
    }));
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (selectedVariant && newQuantity > 0 && newQuantity <= selectedVariant.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      trigger({
        shopId: product.shopId,
        productId: product.productId,
        productVariantId: selectedVariant.productVariantId,
        quantity: quantity,
      })
        .then((res: BaseResponse<never>) => {
          mutate();
          const alert: AlertState = {
            isOpen: true,
            title: "Thành công",
            message: res.message,
            type: AlertType.SUCCESS,
          };
          dispatch(openAlert(alert));
        })
        .catch((err: ErrorResponse) => {
          const alert: AlertState = {
            isOpen: true,
            title: "Thất bại",
            message: err.message || "Thêm vào giỏ hàng thất bại",
            type: AlertType.ERROR,
          };
          dispatch(openAlert(alert));
        });
    } else {
      const alert: AlertState = {
        isOpen: true,
        title: "Thất bại",
        message: "Vui lòng chọn biến thể sản phẩm hợp lệ",
        type: AlertType.ERROR,
      };
      dispatch(openAlert(alert));
    }
  }

  const isDiscountActive = useMemo(() => {
    if (Number(product.discount) <= 0) return false;
    if (!product.discountStartDate || !product.discountEndDate) return false;

    const startTime = new Date(product.discountStartDate).getTime();
    const endTime = new Date(product.discountEndDate).getTime();

    return startTime < currentTime && endTime > currentTime;
  }, [product.discount, product.discountStartDate, product.discountEndDate, currentTime]);
  useEffect(() => {
    if (Object.keys(selectedAttributes).length === 0) return;

    const matchingVariant = product.productVariants.find(variant => {
      return Object.entries(selectedAttributes).every(
        ([attrId, valId]) => variant.productVariantAttributeValues.some(pvav => pvav.productAttributeId === attrId && pvav.productAttributeValueId === valId)
      );
    });

    setTimeout(() => {
      setSelectedVariant(matchingVariant || null);
    }, 0);
  }, [product.productVariants, selectedAttributes]);
  useEffect(() => {
    if (defaultVariant && defaultVariant.productVariantAttributeValues) {
      const initialAttributes: Record<string, string> = {};
      defaultVariant.productVariantAttributeValues.forEach(av => {
        initialAttributes[av.productAttributeId] = av.productAttributeValueId;
      });
      setTimeout(() => {
        setSelectedVariant(defaultVariant);
        setSelectedAttributes(initialAttributes)
      }, 0);
    }
  }, [defaultVariant]);


  return (
    <div className="max-w-5xl mx-auto p-6">
      {isLoading && <Loading/>}
      <div className="flex flex-col gap-10">
        <div className={"flex flex-row gap-10 flex-nowrap bg-white p-4"}>
          <div className={"flex-1"}>
            <div className={"aspect-square rounded-lg overflow-hidden mb-3"}>
              {product.productImages.length > 0 ? (
                <Carousel title={"Hình ảnh sản phẩm"} images={product.productImages.map(value => {
                  return {imageId: value.productImageId, imageUrl: value.imageUrl}
                })}/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>
          <div className={"w-md"}>
            <div className={"text-xs text-grey-c600"}>{product.categoryName}</div>
            <div className={"flex flex-row gap-2"}><h3
              className="text-2xl font-bold ">{product.name}</h3>
              </div>
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              {Number(product.rating) > 0 ? (
                <>
                  <div className="flex items-center">
                    <Star rating={Number(product.rating / product.numberOfRatings)}/>
                  </div>
                  <span
                    className="text-sm text-gray-600 font-medium">{Number(product.rating / product.numberOfRatings).toFixed(1)}</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Chưa có đánh giá</span>
              )}
            </div>

            {/* Price */}
            <div className="mb-3">
              {isDiscountActive ? (
                <div className={"flex flex-col gap-1"}>
                  <div className={"flex items-center gap-3"}>
                    <span className="text-primary-c900 font-bold text-3xl">
                      {formatPrice((selectedVariant?.price ?? 0) * (100 - (product.discount || 0)) / 100)}
                    </span>
                    <span className="text-gray-400 text-sm line-through">
                      {formatPrice(selectedVariant?.price ?? 0)}
                    </span>
                    {isDiscountActive && (
                      <div
                        className=" bg-gradient-to-r from-support-c900 to-support-c800 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                        <span className="text-xs">-</span>
                        <span>{product.discount}%</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-green-600 font-medium ">
                    Tiết kiệm {formatPrice((selectedVariant?.price ?? 0) - (selectedVariant?.price ?? 0) * (100 - (product.discount || 0)) / 100)}
                  </span>
                  {product.discountEndDate && <CountdownTimer endDate={product.discountEndDate}/>}
                </div>
              ) : (
                <div className="text-primary-c900 font-bold text-3xl mb-10.5">
                  {formatPrice(selectedVariant?.price ?? 0)}
                </div>
              )}
            </div>
            {/* Attributes Selection */}
            {product.productAttributes.map(attribute => (
              <div key={attribute.productAttributeId} className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {attribute.productAttributeName}
                </label>
                <div className="flex flex-wrap gap-2">
                  {attribute.productAttributeValues.map(value => (
                    <button
                      type={"button"}
                      key={value.productAttributeValueId}
                      onClick={() =>
                        handleAttributeSelect(attribute.productAttributeId, value.productAttributeValueId)
                      }
                      className={`px-4 py-2 border-2 rounded-lg transition cursor-pointer font-semibold ${
                        selectedAttributes[attribute.productAttributeId] === value.productAttributeValueId
                          ? 'border-primary-c600 bg-primary-c100 text-primary-c800'
                          : 'border-grey-c300 hover:border-grey-c400'
                      }`}
                    >
                      {value.productAttributeValue}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* Stock Info */}
            {selectedVariant && (
              <div className="mb-4">
                <p className="text-sm text-grey-c600">
                  Còn lại: <span className="font-semibold">{selectedVariant.stockQuantity}</span> sản
                  phẩm
                </p>
                <p className="text-sm text-grey-c600">
                  Đã bán: <span
                  className="font-semibold">{formatNumber(selectedVariant.sold || 0)}</span>
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Số lượng</label>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="rounded-full !p-1 !border-2 border-primary-c600 bg-primary-c100 text-primary-c800 disabled:border-grey-c300"
                  startIcon={<KeyboardArrowLeftRoundedIcon/>}
                >
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  onClick={() => handleQuantityChange(1)}
                  disabled={!selectedVariant || quantity >= (selectedVariant.stockQuantity || 99)}
                  className="rounded-full !p-1 !border-2 border-primary-c600 bg-primary-c100 text-primary-c800 disabled:border-grey-c300"
                  startIcon={<KeyboardArrowRightRoundedIcon/>}
                >
                </Button>
              </div>
            </div>
            <div className="mb-4">
              <Button type="button"
                      color={ColorButton.PRIMARY}
                      onClick={handleAddToCart}
                      disabled={isMutating}
                      startIcon={<AddShoppingCartRoundedIcon/>}>
                Thêm vào giỏ
              </Button>
            </div>


          </div>
        </div>
       <div className="bg-white p-8">
         <div className={"mb-8"}>
           <div className={"font-semibold text-2xl mb-4"}>Chi tiết sản phẩm</div>
           <div
             className="text-gray-600 mt-4 whitespace-pre-wrap">
             {product.productDetails && Object.entries(product.productDetails).map(([key, value]) => (
               <div key={key} className="flex flex-row">
                 <span className="font-medium text-grey-c800 mr-40">{key}:</span>
                 <span className="text-grey-c700">{value}</span>
               </div>
           ))}</div>
         </div>
         
          <div className={"font-semibold text-2xl mb-4"}>Mô tả sản phẩm</div>
          <p className="text-gray-600 mt-4 whitespace-pre-wrap">{product.description}</p></div>
      </div>
      <ImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Product Image"
      />
      {product.shopId && <Shop id={product.shopId}/>}

      <Review id={id} product={product}/>
    </div>
  )
}