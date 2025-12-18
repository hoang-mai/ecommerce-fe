'use client';
import {createContext, useContext, useCallback, useMemo, FC, ReactNode} from 'react';
import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {
  LOGIN,
  PRODUCT_VIEW,
  PUSH_SUBSCRIPTION,
  REFRESH_TOKEN,
  REGISTER,
  REVIEW_VIEW,
  SHOP_VIEW,
  USER_VIEW
} from '@/services/api';
import {isTokenExpired} from "@/util/FnCommon";
import {clearAllLocalStorage} from "@/services/localStorage";
import {clearAllCookie} from "@/services/cookie";

type RefreshTokenResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  tokenType: string;
  sessionState: string;
  scope: string;
};

type AxiosContextValue = {
  get<T>(url: string, config?: AxiosRequestConfig & {isToken? : boolean}): Promise<AxiosResponse<T>>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  del<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
};

const AxiosContext = createContext<AxiosContextValue | null>(null);

const ROUTER_NOT_AUTHS = [
  LOGIN,
  REGISTER,
  PRODUCT_VIEW,
  `${SHOP_VIEW}/`,
  REFRESH_TOKEN,
  REVIEW_VIEW,
  `${USER_VIEW}/search-address`,
  `${PUSH_SUBSCRIPTION}/unsubscribe`,
];

export const AxiosProvider: FC<{ children: ReactNode }> = ({children}) => {
  const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'vi'
    },
  });
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig & {isToken? : boolean}) => {
      const isRouterNotAuth = ROUTER_NOT_AUTHS.some(value => {
        return config.url?.includes(value);
      });
      if (isRouterNotAuth && !config.isToken) {
        return config;
      }

      const token = localStorage.getItem('accessToken');
      if (token && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && !isTokenExpired(refreshToken)) {
          try {
            const res = await axios.post<BaseResponse<RefreshTokenResponse>>(
              `${process.env.NEXT_PUBLIC_API_URL}${REFRESH_TOKEN}`, {refreshToken}, {withCredentials: true}
            )
            if (res.data.data) {
              const accessToken = res.data.data.accessToken;
              localStorage.setItem('accessToken', res.data.data.accessToken);
              localStorage.setItem('expiresIn', String(res.data.data.expiresIn));
              localStorage.setItem('refreshToken', res.data.data.refreshToken);
              localStorage.setItem('refreshExpiresIn', String(res.data.data.refreshExpiresIn));
              localStorage.setItem('tokenType', res.data.data.tokenType);
              localStorage.setItem('sessionState', res.data.data.sessionState);
              localStorage.setItem('scope', res.data.data.scope);
              window.dispatchEvent(new Event('authChanged'));
              config.headers.Authorization = `Bearer ${accessToken}`;
              return Promise.resolve(config);
            }
          } catch {
            clearAllCookie();
            clearAllLocalStorage();
            return Promise.reject(new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.'));
          }
        } else {
          clearAllLocalStorage();
          clearAllCookie();
          return Promise.reject(new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.'));
        }
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  )
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      return Promise.reject(error.response?.data || error);
    }
  );
  

  const get = useCallback(<T, >(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
  }, [axiosInstance]);

  const post = useCallback(<T, >(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
  }, [axiosInstance]);

  const patch = useCallback(<T, >(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
  }, [axiosInstance]);

  const put = useCallback(<T, >(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
  }, [axiosInstance]);

  const del = useCallback(<T, >(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
  }, [axiosInstance]);

  const contextValue = useMemo<AxiosContextValue>(() => ({
    get,
    post,
    patch,
    put,
    del,
  }), [get, post, patch, put, del]);

  return <AxiosContext.Provider value={contextValue}>{children}</AxiosContext.Provider>;
}

export const useAxiosContext = () => {
  const ctx = useContext(AxiosContext);
  if (!ctx) throw new Error('useAxiosContext must be used within AxiosProvider');
  return ctx;
};
