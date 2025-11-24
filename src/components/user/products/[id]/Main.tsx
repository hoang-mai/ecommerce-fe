"use client";
import React, {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import useSWR from "swr";
import {PRODUCT_VIEW, CART} from "@/services/api";
import {get, post} from "@/services/axios";
import Loading from "@/components/modals/Loading";
import {ReqAddToCartDTO} from "@/components/user/ProductCard";
import useSWRMutation from "swr/mutation";
import {useCartData} from "@/components/context/cartContext";
import {useDispatch} from "react-redux";
import {openAlert} from "@/redux/slice/alertSlice";
import {AlertType} from "@/enum";
import Button from "@/libs/Button";
import {ColorButton} from "@/enum";
import {
  ProductViewDTO,
  ProductVariantDTO,
} from "@/components/user/layout/header/Cart";
import ImagePreview from "@/libs/ImagePreview";
import {formatPrice} from "@/util/FnCommon";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarHalfRoundedIcon from '@mui/icons-material/StarHalfRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

const productDefault: ProductViewDTO = {
  productId: "",
  name: "",
  description: "",
  discount: 0,
  productImages: [],
  productAttributes: [],
  productVariants: [],
  shopId: "",
  rating: 0,
  productStatus: "",
  totalSold: 0,
  discountStartDate: null,
  discountEndDate: null,
  categoryId: "",
}

type Props = {
  id: string
}

const fetcher = (url: string) => get<BaseResponse<ProductViewDTO>>(url).then(res => res.data);
const addToCartFetcher = (url: string, {arg}: {
  arg: ReqAddToCartDTO
}) => post<BaseResponse<never>>(url, arg).then(res => res.data);

export default function Main({id}: Props) {
  const {data, isLoading, error} = useSWR(`${PRODUCT_VIEW}/${id}`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const product = data?.data ?? productDefault;
  const defaultVariant = useMemo(() =>
    product.productVariants.find(v => v.isDefault) ?? product.productVariants[0], [product.productVariants]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO | null>(defaultVariant || null);
  const [quantity, setQuantity] = useState(1);
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
  const calculateFinalPrice = () => {
    if (!selectedVariant) return 0;
    const basePrice = selectedVariant.price || 0;
    if (product.discount) {
      return Math.round(basePrice * (1 - (product.discount || 0) / 100));
    }
    return basePrice;
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
        setSelectedAttributes(initialAttributes)
      }, 0);
    }
  }, [defaultVariant]);

  const renderStars = (rating: number): React.ReactNode[] => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<StarRoundedIcon key={i} fontSize="small" className="text-yellow-500" />);
      } else if (rating >= i - 0.5) {
        stars.push(<StarHalfRoundedIcon key={i} fontSize="small" className="text-yellow-500" />);
      } else {
        stars.push(<StarBorderRoundedIcon key={i} fontSize="small" className="text-yellow-500" />);
      }
    }
    return stars;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {isLoading && <Loading/>}
      <div className="flex flex-col gap-10">
        <div className={"flex flex-row gap-10"}>
          <div className={""}>
            <div className={"aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3"}>
              {/* Wrap image in a button for keyboard accessibility and make access null-safe */}
              <button
                type="button"
                onClick={() => setSelectedImage(product.productImages[currentImageIndex]?.url ?? '/avatar_hoat_hinh_db4e0e9cf4.webp')}
                aria-label="Open image preview"
                className="w-150 h-150 block"
              >
                <Image
                  src={product.productImages[currentImageIndex]?.url ?? '/avatar_hoat_hinh_db4e0e9cf4.webp'}
                  alt={product.name || 'Product image'}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover rounded"
                  priority={true}
                />
              </button>
            </div>
            {/* Thumbnails */}
            {product.productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      idx === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}</div>
          <div className={""}>
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              {Number(product.rating) > 0 ? (
                <>
                  <div className="flex items-center">
                    {renderStars(Number(product.rating))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{Number(product.rating).toFixed(1)}</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Chưa có đánh giá</span>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold text-primary-c900`}>
                  {formatPrice(calculateFinalPrice())}
                </span>
                {Number(product.discount) > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(selectedVariant?.price || 0)}
                    </span>
                    <span className="text-sm bg-secondary-c100 text-secondary-c600 px-2 py-1 rounded">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>
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
                  Còn lại: <span className="font-semibold">{selectedVariant.stockQuantity}</span> sản phẩm
                </p>
                <p className="text-sm text-grey-c600">
                  Đã bán: <span className="font-semibold">{selectedVariant.sold || 0}</span>
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
        <p className="text-gray-600 mt-4">{product.description}</p>
      </div>
      <ImagePreview
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
        alt="Product Image"
      />
    </div>
  )
}