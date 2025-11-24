'use client';
import {createContext, useContext, useRef, useEffect, useCallback, useMemo, FC, ReactNode} from 'react';
import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import { LOGIN, PRODUCT_VIEW, REFRESH, REGISTER } from '@/services/api';

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
  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
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
  REFRESH,
];

export const AxiosProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const axiosInstanceRef = useRef<AxiosInstance>(axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'vi'
    },
  }));

  const isRefreshingRef = useRef<boolean>(false);
  type ResolveFn = (value: string | PromiseLike<string | null> | null) => void;
  type RejectFn = (reason?: unknown) => void;
  const failedQueueRef = useRef<Array<{
    resolve: ResolveFn;
    reject: RejectFn;
  }>>([]);

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueueRef.current.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    failedQueueRef.current = [];
  };

  useEffect(() => {
    const instance = axiosInstanceRef.current;

    const reqInterceptor = instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        const isRouterNotAuth = ROUTER_NOT_AUTHS.some(value => {
          return config.url?.includes(value);
        });
        if (token && !isRouterNotAuth) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    const resInterceptor = instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        console.log(error);
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshingRef.current) {
            try {
              const token = await new Promise<string | null>((resolve, reject) => {
                failedQueueRef.current.push({resolve, reject});
              });
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return await instance(originalRequest);
            } catch (err) {
              return Promise.reject(err);
            }
          }

          originalRequest._retry = true;
          isRefreshingRef.current = true;

          const refreshToken = localStorage.getItem('refreshToken');

          if (!refreshToken) {
            processQueue(new Error('No refresh token'), null);
            isRefreshingRef.current = false;
            return Promise.reject(error);
          }

          axios.post<BaseResponse<RefreshTokenResponse>>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`, {refreshToken}
          )
            .then(res => {
              if (res.data.data) {
                const accessToken = res.data.data.accessToken;
                localStorage.setItem('accessToken', res.data.data.accessToken);
                localStorage.setItem('expiresIn', String(res.data.data.expiresIn));
                localStorage.setItem('refreshToken', res.data.data.refreshToken);
                localStorage.setItem('refreshExpiresIn', String(res.data.data.refreshExpiresIn));
                localStorage.setItem('tokenType', res.data.data.tokenType);
                localStorage.setItem('sessionState', res.data.data.sessionState);
                localStorage.setItem('scope', res.data.data.scope);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                isRefreshingRef.current = false;
                return instance(originalRequest);
              } else {
                processQueue(new Error('Failed to refresh token'), null);
                isRefreshingRef.current = false;
                return Promise.reject(error);
              }
            }).catch(err => {
              processQueue(err, null);
              isRefreshingRef.current = false;
              return Promise.reject(err);
            });
        }

        return Promise.reject(error.response?.data || error);
      }
    );

    return () => {
      instance.interceptors.request.eject(reqInterceptor);
      instance.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const get = useCallback(<T,>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstanceRef.current.get<T>(url, config);
  }, []);

  const post = useCallback(<T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstanceRef.current.post<T>(url, data, config);
  }, []);

  const patch = useCallback(<T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstanceRef.current.patch<T>(url, data, config);
  }, []);

  const put = useCallback(<T,>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstanceRef.current.put<T>(url, data, config);
  }, []);

  const del = useCallback(<T,>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstanceRef.current.delete<T>(url, config);
  }, []);

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
