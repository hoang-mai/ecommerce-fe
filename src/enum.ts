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
}

export enum ProductVariantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  OUT_OF_STOCK = "OUT_OF_STOCK"
}