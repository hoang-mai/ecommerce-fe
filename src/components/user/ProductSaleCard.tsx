import {FlashSaleProductView} from "@/types/interface";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {formatPrice} from "@/util/fnCommon";
import React from "react";

type ProductSaleCardProps = {
  product: FlashSaleProductView;
}
export default function ProductSaleCard({product}: ProductSaleCardProps){
  const router = useRouter();
  const discountedPrice = product.originalPrice * (1 - product.discountPercentage / 100);
  const soldPercent = Math.round((product.soldQuantity / product.totalQuantity) * 100);
  return (
    <div
      onClick={() => router.push(`/products/${product.productId}`)}
      className="flex-shrink-0 w-44 bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all "
    >
      {/* Product Image */}
      <div className="relative">
        <Image
          src={product.productImages?.[0]?.imageUrl || '/placeholder.png'}
          alt={product.productName}
          width={176}
          height={176}
          className="w-full h-44 object-cover"
        />
        <div
          className="absolute top-2 left-2 bg-gradient-to-r from-support-c900 to-support-c800 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <span className="text-xs">-</span>
          <span>{product.discountPercentage}%</span>
        </div>
      </div>
      {/* Product Info */}
      <div className="p-3">
        <h3 className="text-sm text-grey-c900 h-10 font-semibold truncate">{product.productName}</h3>
        <div className="mt-2">
          <span className="text-primary-c900 font-bold text-base">{formatPrice(discountedPrice)}</span>
          <span className="text-grey-c500 line-through text-xs ml-2">{formatPrice(product.originalPrice)}</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2">
          <div className="relative h-5 bg-primary-c100 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-primary-c400 to-primary-c600 rounded-full"
              style={{ width: `${soldPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow">
                          {product.isSoldOut ? 'Đã bán hết' : `Đã bán ${product.soldQuantity}`}
                        </span>
          </div>
        </div>
      </div>
    </div>
  );

}