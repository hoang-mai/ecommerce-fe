import React, {useMemo, useRef, useState} from "react";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import {formatNumber, formatPrice} from "@/util/fnCommon";
import Button from "@/libs/Button";
import {AlertType, ColorButton} from "@/types/enum";
import {useCartData, useCartRef} from "@/components/provider/CartProvider";
import Image from "next/image";
import SelectProductVariantModal from "@/components/user/SelectProductVariantModal";
import useSWRMutation from "swr/mutation";
import {CART, USER_CATEGORY} from "@/services/api";
import {useAxiosContext} from '@/components/provider/AxiosProvider';
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";
import {ProductView} from "@/types/interface";
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CountdownTimer from "@/libs/CountDownTime";
import Star from "@/libs/Star";
import {FlashSaleProductView} from "@/types/interface";

interface ProductCardProps {
  product: ProductView;
}

export interface ReqAddToCartDTO {
  shopId: string;
  productId: string;
  productVariantId: string;
  quantity: number;
}

interface UserCategoryDTO {
  categoryId: string;
  userCategoryType: string;
}

export default function ProductCard({product}: ProductCardProps) {
  const [isOpenProductSelectVariant, setOpenProductSelectVariant] = useState(false);
  const {mutate} = useCartData();
  const defaultVariant = product.productVariants.find(v => v.isDefault) ?? product.productVariants[0];
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cartRef = useCartRef();
  const [currentTime] = useState(() => Date.now());
  const router = useRouter();
  const dispatch = useDispatch();
  const {post} = useAxiosContext();
  const fetcher = (url: string, {arg}: { arg: ReqAddToCartDTO }) =>
    post<BaseResponse<never>>(url, arg, {}).then(res => res.data);
  const {trigger, isMutating} = useSWRMutation(`${CART}`, fetcher);

  const fetcherClick = (url: string, {arg}: { arg: UserCategoryDTO }) =>
    post<BaseResponse<never>>(url, arg, {}).then(res => res.data);
  const {trigger: triggerClick} = useSWRMutation(USER_CATEGORY, fetcherClick);
  const variantSaleActive = useMemo(() => {
    if (!defaultVariant) return false;
    return (defaultVariant.salePrice != null && defaultVariant.salePrice < defaultVariant.price);
  }, [defaultVariant]);

  const activeFlashSale = useMemo((): FlashSaleProductView | null => {
    if (!product.flashSaleProductViews || product.flashSaleProductViews.length === 0 || !defaultVariant) return null;

    const flashSale = product.flashSaleProductViews.find(fs =>
      fs.productVariantId === defaultVariant.productVariantId
    );

    if (!flashSale) return null;

    const startTime = new Date(flashSale.startTime).getTime();
    const endTime = new Date(flashSale.endTime).getTime();

    if (startTime <= currentTime && endTime > currentTime && !flashSale.isSoldOut) {
      return flashSale;
    }

    return null;
  }, [product.flashSaleProductViews, defaultVariant, currentTime]);

  const handleAddToCart = () => {
    if (product.productVariants.length > 1) {
      setOpenProductSelectVariant(true);
    } else {
      animationAddToCart();
      trigger({
        shopId: product.shopId,
        productId: product.productId,
        productVariantId: defaultVariant.productVariantId,
        quantity: 1,
      }).then(() => {
        mutate();
      }).catch((err: ErrorResponse) => {
        const alert: AlertState = {
          isOpen: true,
          title: "Thất bại",
          message: err.message || "Thêm vào giỏ hàng thất bại",
          type: AlertType.ERROR,
        }
        dispatch(openAlert(alert));
      })
    }

  };

  const animationAddToCart = () => {
    const img = imageRef.current;
    const cart = cartRef.current;
    if (!img || !cart) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = `${imgRect.left}px`;
    clone.style.top = `${imgRect.top}px`;
    clone.style.width = `${imgRect.height}px`;
    clone.style.height = `${imgRect.height}px`;
    clone.style.borderRadius = "50%";
    clone.style.objectFit = "cover";
    clone.style.zIndex = "9999";
    clone.style.pointerEvents = "none";
    clone.style.transformOrigin = "center";
    clone.style.opacity = "1";

    document.body.appendChild(clone);

    clone.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";

    requestAnimationFrame(() => {
      clone.style.transform = "scale(0.4)";
      clone.style.opacity = "0.8";
    });

    setTimeout(() => {
      const cloneRect = clone.getBoundingClientRect();
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;
      const translateX = endX - (cloneRect.left + cloneRect.width / 2);
      const translateY = endY - (cloneRect.top + cloneRect.height / 2);

      clone.style.transition = "transform 0.8s cubic-bezier(0.42,0,0.58,1), opacity 0.8s";
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;
        clone.style.opacity = "0.2";
      });

      clone.addEventListener(
        "transitionend",
        () => {
          clone.remove();
          cart?.classList.add("animate-cart-bump");
          setTimeout(() => cart?.classList.remove("animate-cart-bump"), 300);
        },
        {once: true}
      );
    }, 350);

  }


  return (
    <>
      <div
        key={product.productId}
        className="bg-white rounded-lg shadow hover:shadow-xl transition group overflow-hidden"
        onClick={() => {
          triggerClick({
            categoryId: product.categoryId,
            userCategoryType: "CLICK"
          })
          router.push(`/products/${product.productId}`)
        }}
      >
        <div className="relative h-64">
            <Image
              ref={imageRef}
              src={product.productImages[0]?.imageUrl || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-110 transition duration-300"
            />
          { activeFlashSale && (
              <div
                className="absolute top-3 left-3 bg-gradient-to-r from-support-c900 to-support-c800 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                <span className="text-xs">-</span>
                <span>{activeFlashSale.discountPercentage}%</span>
              </div>
          )}
        </div>

        <div className="p-4">
          <div className={"text-xs text-grey-c600"}>{product.categoryName}</div>
          <h3 className="font-semibold text-lg mb-1 truncate h-10 text-grey-c900">{product.name}</h3>
          <div className="flex flex-col">
            <div className={"flex flex-row items-center gap-2"}>
              <div className="text-sm text-grey-c600">
                Đã bán <span className={"font-semibold"}>{formatNumber(product.totalSold) || 0}</span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1 text-gray-600">
                <ChatBubbleOutlineRoundedIcon className={"!w-4 !h-4"}/>
                <span className="text-sm font-semibold">{formatNumber(product.numberOfReviews || 0)}</span>
              </div>
            </div>
            {Number(product.numberOfRatings) > 0 ? <div className="flex items-center">
                <Star rating={Number(product.rating / product.numberOfRatings)}/>
                <span
                  className="text-sm text-gray-600 font-medium">{Number(product.rating / product.numberOfRatings).toFixed(1)}</span>
              </div> :
              <div className="flex items-center">
                <Star rating={0}/>
                <span className="text-sm text-gray-600 font-medium">0.0</span>
              </div>
            }

          </div>

          <div className="mb-3">
            {activeFlashSale ? (
              <div className={"flex flex-col"}>
                <div className={"flex items-center gap-2"}>
                  <span className="text-primary-c900 font-bold text-lg">
                    {formatPrice(activeFlashSale.originalPrice * (100 - activeFlashSale.discountPercentage) / 100)}
                  </span>
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(activeFlashSale.originalPrice)}
                  </span>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  Tiết kiệm {formatPrice(activeFlashSale.originalPrice * activeFlashSale.discountPercentage / 100)}
                </span>
                <CountdownTimer endDate={activeFlashSale.endTime}/>
              </div>
            ) : variantSaleActive ? (
              <div className={"flex flex-col mb-7"}>
                <div className={"flex items-center gap-2"}>
                  <span className="text-primary-c900 font-bold text-lg">
                    {formatPrice(defaultVariant.salePrice!)}
                  </span>
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(defaultVariant.price)}
                  </span>
                </div>
                <span className="text-xs text-green-600 font-medium ">
                  Tiết kiệm {formatPrice(defaultVariant.price - defaultVariant.salePrice!)}
                </span>
              </div>
            ) : (
              <div className="text-primary-c900 font-bold text-lg mb-10.5">
                {formatPrice(defaultVariant.price)}
              </div>
            )}
          </div>

          <Button
            title="Thêm vào giỏ"
            color={ColorButton.PRIMARY}
            fullWidth
            startIcon={<AddShoppingCartRoundedIcon/>}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isMutating}
          >
            Thêm vào giỏ
          </Button>
        </div>
      </div>
      {isOpenProductSelectVariant &&
        <SelectProductVariantModal isOpen={isOpenProductSelectVariant} product={product}
                                   setIsOpen={setOpenProductSelectVariant}/>
      }
    </>
  );
};
