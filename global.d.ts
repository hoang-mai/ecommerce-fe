import {AlertType} from "@/type/enum";

declare global {
  type ErrorResponse = {
    statusCode: number;
    message: string;
    timestamp: string;
  }

  type Option = {
    id: number | string;
    label: string
  }

  type BaseResponse<T> = {
    statusCode: number;
    message: string;
    data?: T;
  };

  type PageResponse<T> = {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    data: T[];
  }

  type AlertState = {
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
  }

  type NotificationState = {
    notificationId :string;
    userId :number;
    title: string;
    message: string;
    notificationType :AlertType
    isRead :boolean;
    sentRealtime :boolean;
    createdAt: string;
    updatedAt: string;
  }

}

export {};