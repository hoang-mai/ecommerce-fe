"use client";
import React, { createContext, useRef, useContext } from "react";

interface CartContextType {
  cartRef: React.RefObject<HTMLDivElement | null>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cartRef = useRef<HTMLDivElement | null>(null);

  return (
    <CartContext.Provider value={{ cartRef }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartRef = (): React.RefObject<HTMLDivElement | null> => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartRef must be used within CartProvider");
  return context.cartRef;
};
