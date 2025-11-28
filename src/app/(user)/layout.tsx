import {ReactNode} from "react";
import Header from "@/components/user/layout/header/Header";
import {CartProvider} from "@/components/provider/CartProvider";
import Footer from "@/components/user/layout/footer/Footer";

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {

  return (
    <>
      <CartProvider>
        <Header/>
        <main className={"min-h-screen overflow-y-auto"}>
          {children}
          <Footer/>
        </main>
      </CartProvider>
    </>

  );
}
