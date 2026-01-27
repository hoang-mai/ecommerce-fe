import {ReqAddToCartDTO} from "@/components/user/ProductCard";
import Modal from "@/libs/Modal";
import React, {useEffect, useMemo, useState} from "react";
import {formatPrice} from "@/util/fnCommon";
import ImagePreview from "@/libs/ImagePreview";
import useSWRMutation from "swr/mutation";
import {CART} from "@/services/api";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {AlertType} from "@/types/enum";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import Loading from "@/components/modals/Loading";
import {ProductView, ProductVariant, FlashSaleProductView} from "@/types/interface";
import {useCartData} from "@/components/provider/CartProvider";
import Carousel from "@/libs/Carousel";
import CountdownTimer from "@/libs/CountDownTime";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import Divide from "@/libs/Divide";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

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
  const [currentTime] = useState(() => Date.now());
  const {trigger, isMutating} = useSWRMutation(`${CART}`, fetcher);

  const handleAttributeSelect = (productAttributeId: string, productAttributeValueId: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [productAttributeId]: productAttributeValueId
    }));
  };

  const activeFlashSale = useMemo((): FlashSaleProductView | null => {
    if (!product.flashSaleProductViews || product.flashSaleProductViews.length === 0 || !selectedVariant) return null;

    const flashSale = product.flashSaleProductViews.find(fs =>
      fs.productVariantId === selectedVariant.productVariantId
    );

    if (!flashSale) return null;

    const startTime = new Date(flashSale.startTime).getTime();
    const endTime = new Date(flashSale.endTime).getTime();

    if (startTime <= currentTime && endTime > currentTime && !flashSale.isSoldOut) {
      return flashSale;
    }

    return null;
  }, [product.flashSaleProductViews, selectedVariant, currentTime]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    const maxQuantity = activeFlashSale
      ? Math.min(selectedVariant?.stockQuantity || 99, activeFlashSale.maxQuantityPerUser, activeFlashSale.totalQuantity - activeFlashSale.soldQuantity)
      : (selectedVariant?.stockQuantity || 99);
    if (selectedVariant && newQuantity > 0 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleOnSave = () => {
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
  // Sale is now a per-variant field (salePrice). Consider sale active when salePrice is set and lower than original price.
  const variantSaleActive = useMemo(() => {
    if (!selectedVariant) return false;
    return (selectedVariant.salePrice != null && selectedVariant.salePrice < selectedVariant.price);
  }, [selectedVariant]);

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
      maxWidth={"3xl"}
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
          <div className={"flex gap-2"}>
            <h3 className="text-2xl font-bold truncate">{product.name}</h3>
            {activeFlashSale && (
              <div
                className="bg-gradient-to-r from-support-c900 to-support-c800 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1">
                <span className="text-xs">-</span>
                <span>{activeFlashSale.discountPercentage}%</span>
              </div>
            )}
          </div>
          {/* Price */}
          <div className="mb-6">
            {activeFlashSale ? (
              <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center gap-3 bg-gradient-to-b from-primary-c200 to-white"}>
                  <h2 className="text-xl font-bold text-primary-c500 relative">
                    <span>F</span><FlashOnRoundedIcon
                    className="text-primary-c500 animate-pulse absolute top-1.5 left-1.5"/><span className={"ml-3"}>ASH SALE</span>
                  </h2>
                </div>
                <div className={"flex items-center gap-3"}>
                  <span className="text-primary-c900 font-bold text-3xl">
                    {formatPrice(activeFlashSale.originalPrice * (100 - activeFlashSale.discountPercentage) / 100)}
                  </span>
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(activeFlashSale.originalPrice)}
                  </span>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  Tiết kiệm {formatPrice(activeFlashSale.originalPrice * activeFlashSale.discountPercentage / 100)}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-grey-c600">Đã bán: {activeFlashSale.soldQuantity}/{activeFlashSale.totalQuantity}</span>
                  <div className="flex-1 max-w-[120px] h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-c400 to-primary-c600 rounded-full"
                      style={{width: `${Math.min(100, (activeFlashSale.soldQuantity / activeFlashSale.totalQuantity) * 100)}%`}}
                    />
                  </div>
                </div>
                <CountdownTimer endDate={activeFlashSale.endTime}/>
              </div>
            ) : variantSaleActive && selectedVariant ? (
              <div className={"flex flex-col gap-1"}>
                <div className={"flex items-center gap-3"}>
                  <span className="text-primary-c900 font-bold text-3xl">
                    {formatPrice(selectedVariant.salePrice!)}
                  </span>
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(selectedVariant.price)}
                  </span>
                </div>
                <span className="text-xs text-green-600 font-medium ">
                  Tiết kiệm {formatPrice(selectedVariant.price - selectedVariant.salePrice!)}
                </span>
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
                    className={`px-2 py-2 text-xs border-2 rounded-lg transition cursor-pointer font-semibold ${
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
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-grey-c700">Số lượng:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) =>{
                  e.stopPropagation();
                  e.preventDefault();
                  handleQuantityChange(-1)}}
                disabled={quantity <= 1}
                className=" cursor-pointer w-8 h-8 flex items-center justify-center rounded-md border border-grey-c300 bg-white text-grey-c700 hover:border-primary-c600 hover:text-primary-c600 hover:bg-primary-c50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-grey-c300 disabled:hover:bg-white disabled:hover:text-grey-c700 transition-all duration-200"
              >
                <RemoveRoundedIcon className="text-[18px]"/>
              </button>

              <span className="min-w-[40px] text-center font-semibold text-base text-grey-c900">
                  {quantity}
                </span>

              <button
                onClick={(e) =>{
                  e.stopPropagation();
                  e.preventDefault();
                  handleQuantityChange(1)}}
                disabled={!selectedVariant || quantity >= (selectedVariant.stockQuantity || 99)}
                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md border border-grey-c300 bg-white text-grey-c700 hover:border-primary-c600 hover:text-primary-c600 hover:bg-primary-c50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-grey-c300 disabled:hover:bg-white disabled:hover:text-grey-c700 transition-all duration-200"
              >
                <AddRoundedIcon className="text-[18px]"/>
              </button>
            </div>

            {selectedVariant?.stockQuantity && selectedVariant.stockQuantity < 10 && selectedVariant.stockQuantity > 0 && (
              <span className="text-xs text-support-c700 font-medium">
                  Chỉ còn {selectedVariant.stockQuantity} sản phẩm
                </span>
            )}
          </div>

        </div>
      </div>
      <Divide/>
      <span className="text-gray-900 mt-4 text-xl">Mô tả sản phẩm:</span>
      <p className="text-gray-600 mt-4 whitespace-pre-wrap">{product.description}</p>
    </Modal>
    {/* Image Preview */}
    <ImagePreview
      imageUrl={selectedImage}
      onClose={() => setSelectedImage(null)}
      alt="Product Image"
    />
  </>
}