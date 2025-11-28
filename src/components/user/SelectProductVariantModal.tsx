import {ReqAddToCartDTO} from "@/components/user/ProductCard";
import Modal from "@/libs/Modal";
import React, {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {formatPrice} from "@/util/FnCommon";
import ImagePreview from "@/libs/ImagePreview";
import Button from "@/libs/Button";
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import useSWRMutation from "swr/mutation";
import {CART} from "@/services/api";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {AlertType} from "@/type/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import Loading from "@/components/modals/Loading";
import {ProductView, ProductVariant} from "@/type/interface";
import {useCartData} from "@/components/provider/CartProvider";
import Carousel from "@/libs/Carousel";
import CountdownTimer from "@/libs/CountDownTime";

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: ProductView
}

export default function SelectProductVariantModal({isOpen, setIsOpen, product}: Props) {
  const {post} = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: ReqAddToCartDTO }) =>
    post<BaseResponse<never>>(url, arg, {}).then(res => res.data);

  const {mutate} = useCartData();
  const defaultVariant = useMemo(() => product.productVariants.find(v => v.isDefault) ?? product.productVariants[0], [product.productVariants]);
  const dispatch = useDispatch();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (defaultVariant && defaultVariant.productVariantAttributeValues) {
      defaultVariant.productVariantAttributeValues.forEach(av => {
        map[av.productAttributeId] = av.productAttributeValueId;
      });
    }
    return map;
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant || null);
  const {trigger, isMutating} = useSWRMutation(`${CART}`, fetcher);
  const calculateFinalPrice = () => {
    if (!selectedVariant) return 0;
    const basePrice = selectedVariant.price || 0;
    if (product.discount) {
      return Math.round(basePrice * (1 - (product.discount || 0) / 100));
    }
    return basePrice;
  };

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

  const handleOnSave = () => {
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
          setIsOpen(false);
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
  };


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
  return <>
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title={"Thêm sản phẩm vào giỏ hàng"}
      saveButtonText={"Thêm vào giỏ hàng"}
      onSave={handleOnSave}
      isLoading={isMutating}
      disableSave={!selectedVariant}
    >
      {isMutating && <Loading/>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
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

        {/* Product Info */}
        <div>
          <div className={"flex gap-2"}><h3 className="text-2xl font-bold truncate">{product.name}</h3>
            {Number(product.discount) > 0 && (
              <div
                className=" bg-gradient-to-r from-support-c900 to-support-c800 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                <span className="text-xs">-</span>
                <span>{product.discount}%</span>
              </div>
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
                </>
              )}
            </div>
            <div className={"flex gap-2"}>
              <span className="text-xs text-green-600 font-medium ">
                Tiết kiệm {formatPrice(defaultVariant.price - defaultVariant.price * (100 - (product.discount || 0)) / 100)}
              </span>
              {product.discountEndDate && <CountdownTimer endDate={product.discountEndDate}/>}
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

        </div>
      </div>
      <p className="text-gray-600 mt-4">{product.description}</p>
    </Modal>
    {/* Image Preview */}
    <ImagePreview
      imageUrl={selectedImage}
      onClose={() => setSelectedImage(null)}
      alt="Product Image"
    />
  </>
}