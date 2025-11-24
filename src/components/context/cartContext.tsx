"use client";
import React, { createContext, useRef, useContext } from "react";
import { get } from "@/services/axios";
import { CART } from "@/services/api";
import useSWR from "swr";

interface CartContextType {
  cartRef: React.RefObject<HTMLDivElement | null>;
  data: number | undefined;
  mutate: () => Promise<number | undefined>;
}

const fetcherCartCount = (url: string) =>
  get<BaseResponse<number>>(url, {}).then(res => res.data.data);

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cartRef = useRef<HTMLDivElement | null>(null);
  const { data, mutate } = useSWR(`${CART}/count`, fetcherCartCount,{
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  return (
    <CartContext.Provider value={{ cartRef, data, mutate }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartRef = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartRef must be used within CartProvider");
  return context.cartRef;
};

export const useCartData = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartData must be used within CartProvider");
  return { data: context.data, mutate: context.mutate };
};
