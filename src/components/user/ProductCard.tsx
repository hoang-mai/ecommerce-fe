import React, { useRef } from "react";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {formatPrice} from "@/util/FnCommon";
import Button from "@/libs/Button";
import {ColorButton} from "@/enum";
import {useCartRef} from "@/components/context/cartContext";
import Image from "next/image";
interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  sold: number;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cartRef = useCartRef();
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const img = cardRef.current?.querySelector("img") as HTMLImageElement | null;
    if (!img || !cartRef.current) return;

    // Lấy vị trí ban đầu và kết thúc
    const imgRect = img.getBoundingClientRect();
    const cartRect = cartRef.current.getBoundingClientRect();

    // Clone ảnh
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
          cartRef.current?.classList.add("animate-cart-bump");
          setTimeout(() => cartRef.current?.classList.remove("animate-cart-bump"), 300);
        },
        { once: true }
      );
    }, 350);

  };

  return (
    <div
      ref={cardRef}
      key={product.id}
      className="bg-white rounded-lg shadow hover:shadow-xl transition group overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-48 object-cover group-hover:scale-110 transition duration-300"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 truncate h-10">{product.name}</h3>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) =>
              i < Math.floor(product.rating) ? (
                <StarIcon key={i} sx={{ fontSize: 14, color: "#facc15" }} />
              ) : (
                <StarBorderIcon key={i} sx={{ fontSize: 14, color: "#d1d5db" }} />
              )
            )}
          </div>
          <span className="text-xs text-gray-600">
            ({product.rating}) | Đã bán {product.sold}
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-primary-c900 font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <Button
          title="Thêm vào giỏ"
          color={ColorButton.PRIMARY}
          fullWidth
          startIcon={<AddShoppingCartRoundedIcon />}
          onClick={handleAddToCart}
        >
          Thêm vào giỏ
        </Button>
      </div>

    </div>
  );
};
