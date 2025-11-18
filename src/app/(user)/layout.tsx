import {ReactNode} from "react";
import Header from "@/components/user/layout/header/Header";
import {CartProvider} from "@/components/context/cartContext";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {

  return (
    <>
      <CartProvider>
        <Header/>
        {children}
      </CartProvider>
    </>

  );
}
