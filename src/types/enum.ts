export enum Role {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum AlertType {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  PARTIALLY_OUT_OF_STOCK = 'PARTIALLY_OUT_OF_STOCK',
  ALL_OUT_OF_STOCK= 'ALL_OUT_OF_STOCK',
}

export enum NotificationType{
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  PAYMENT = 'PAYMENT',
  PARTIALLY_OUT_OF_STOCK = 'PARTIALLY_OUT_OF_STOCK',
  ALL_OUT_OF_STOCK= 'ALL_OUT_OF_STOCK',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: 'Nam',
  [Gender.FEMALE]: 'Nữ',
  [Gender.OTHER]: 'Khác',
};

export enum ColorButton {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

export enum SortDir {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ShopStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum UserVerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const UserVerificationStatusLabel: Record<UserVerificationStatus, string> = {
  [UserVerificationStatus.PENDING]: 'Đang chờ',
  [UserVerificationStatus.APPROVED]: 'Đã duyệt',
  [UserVerificationStatus.REJECTED]: 'Đã từ chối',
};

export enum CategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
  SUSPENDED = "SUSPENDED"
}

export enum ProductVariantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK"
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
  DELIVERED = "DELIVERED",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED"
}

export enum RatingNumber {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5
}

export enum ChatType {
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  DIRECT = "DIRECT",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  LOCATION = "LOCATION",
  STICKER = "STICKER",
  GIF = "GIF",
  POLL = "POLL",
  REACTION = "REACTION",
  LINK = "LINK",
  OTHER = "OTHER",
}

export enum FlashSaleScheduleStatus{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
