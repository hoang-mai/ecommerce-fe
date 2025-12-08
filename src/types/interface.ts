import {
  ProductStatus,
  ProductVariantStatus,
  RatingNumber,
  ShopStatus,
  ChatType,
  MessageType,
  AccountStatus
} from "@/types/enum";

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
  numberOfRatings: number;
  numberOfReviews: number;
  ratingStatistics: Record<RatingNumber, number>;
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

export interface ShopView {
  shopId: string;
  shopName: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  shopStatus: ShopStatus;
  ownerId: string;
  province: string;
  ward: string;
  detail: string;
  phoneNumber: string;
  totalProducts: number;
  activeProducts: number;
  totalSold: number;
  totalRevenue: number;
  rating: number;
  numberOfRatings: number;
  numberOfReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCartItemViewDTO {
  productCartItemId: string;
  productView: ProductView;
  productVariantId: string;
  quantity: number;
}

export interface CartItemViewDTO {
  cartItemId: string;
  shopView: ShopView;
  productCartItems: ProductCartItemViewDTO[];
}

export interface CartViewDTO {
  cartId: string;
  cartItems: CartItemViewDTO[];
}

export interface ReviewReplyView {
  replyId: string;
  replierId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewView {
  reviewId: string;
  orderItemId: string;
  isUpdated: boolean;
  productId: string;
  productName: string;
  productVariantId: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  ownerId: string;
  shopId: string;
  rating: RatingNumber;
  comment: string;
  imageUrls?: string[];
  attributes?: Record<string, string>;
  reviewReplyView?: ReviewReplyView | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO{
  messageId: string;
  chatId: string;
  senderId: string;
  shopId: string;
  messageType: MessageType;
  messageContent: string;
  replyToMessageId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  readBy: string[];
}

export interface ChatDTO {
  chatId: string;
  chatType: ChatType;
  shopCache: ShopCache;
  createdAt: string;
  updatedAt: string;
  userCacheList: UserCache[];
  lastMessage: MessageDTO;
}

export interface ShopCache {
  shopId: string;
  shopName: string;
  logoUrl: string;
  ownerId: string;
  isOnline: boolean;
  shopStatus: ShopStatus;
}
export interface UserCache{
  userId: string;
  avatarUrl: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: AccountStatus;
  isOnline: boolean;
}

export interface ReqPrivateMessageDTO{
  receiverId : string;
  chatId?: string;
  messageContent : string;
  messageType : MessageType;
  shopId: string;
}