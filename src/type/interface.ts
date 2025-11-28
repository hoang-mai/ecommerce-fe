import {ProductStatus, ProductVariantStatus, ShopStatus} from "@/type/enum";

export interface ProductImage {
  productImageId: string;
  imageUrl: string;
}

export interface ProductAttributeValue {
  productAttributeValueId: string;
  productAttributeValue: string;
}

export interface ProductAttribute {
  productAttributeId: string;
  productAttributeName: string;
  productAttributeValues: ProductAttributeValue[];
}

export interface ProductVariantAttributeValue {
  productVariantAttributeValueId: string;
  productAttributeId: string;
  productAttributeValueId: string;
}

export interface ProductVariant {
  productVariantId: string;
  productVariantStatus: ProductVariantStatus;
  price: number;
  stockQuantity: number;
  sold: number;
  isDefault: boolean;
  productVariantAttributeValues: ProductVariantAttributeValue[];
}

export interface ProductView {
  productId: string;
  shopId: string;
  rating: number;
  totalReviews: number;
  name: string;
  description: string;
  productStatus: ProductStatus;
  totalSold: number;
  discount: number | null
  discountStartDate: string | null;
  discountEndDate: string | null;
  categoryId: string;
  categoryName: string;
  shopStatus: ShopStatus;
  productImages: ProductImage[];
  productAttributes: ProductAttribute[];
  productVariants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCartItemViewDTO {
  productCartItemId: string;
  productVariantId: string;
  quantity: number;
}

export interface CartItemViewDTO {
  cartItemId: string;
  productView: ProductView;
  productCartItems: ProductCartItemViewDTO[];
}

export interface CartViewDTO {
  cartId: string;
  cartItems: CartItemViewDTO[];
}