import React, {useRef, useState} from "react";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import {formatPrice} from "@/util/FnCommon";
import Button from "@/libs/Button";
import {AlertType, ColorButton} from "@/enum";
import {useCartData, useCartRef} from "@/components/context/cartContext";
import Image from "next/image";
import SelectProductVariantModal from "@/components/user/SelectProductVariantModal";
import useSWRMutation from "swr/mutation";
import {CART} from "@/services/api";
import {post} from "@/services/axios";
import {openAlert} from "@/redux/slice/alertSlice";
import {useDispatch} from "react-redux";
import {useRouter} from "next/navigation";
import {ProductViewDTO} from "@/components/user/layout/header/Cart";

interface ProductCardProps {
  product: ProductViewDTO;
}

export interface ReqAddToCartDTO {
  productId: string;
  productVariantId: string;
  quantity: number;
}


const fetcher = (url: string, {arg}: { arg: ReqAddToCartDTO }) =>
  post<BaseResponse<never>>(url, arg, {}).then(res => res.data);

export default function ProductCard({product}: ProductCardProps) {
  const [isOpenProductSelectVariant, setOpenProductSelectVariant] = useState(false);
  const {mutate} = useCartData();
  const defaultVariant = product.productVariants.find(v => v.isDefault) ?? product.productVariants[0];
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cartRef = useCartRef();
  const {trigger, isMutating} = useSWRMutation(`${CART}`, fetcher);
  const router = useRouter();
  const dispatch = useDispatch();
  const handleAddToCart = () => {
    if (product.productVariants.length > 1) {
      setOpenProductSelectVariant(true);
    } else {
      animationAddToCart();
      trigger({
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
        onClick={() => router.push(`/products/${product.productId}`)}
      >
        <div className="relative overflow-hidden">
          <Image
            ref={imageRef}
            src={product.productImages[0]?.url || "/placeholder.png"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
          />
          {Number(product.discount) > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{product.discount}%
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate h-10">{product.name}</h3>

          <div className="flex items-center gap-1 mb-2">

          <span className="text-sm text-grey-c600">
            Đã bán <span className={"font-semibold"}>{product.totalSold || 0}</span>
          </span>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2">
            <span className="text-primary-c900 font-bold text-lg">
              {formatPrice(defaultVariant.price * (100 + (product.discount || 0)) / 100)}
            </span>
              {Number(product.discount) > 0 &&
                  <span className="text-gray-400 text-sm line-through">
                {formatPrice(defaultVariant.price * (100 + (product.discount || 0)) / 100)}
                    {formatPrice(defaultVariant.price)}
              </span>
              }
            </div>
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
