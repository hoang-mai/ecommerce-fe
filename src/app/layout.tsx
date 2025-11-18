import type {Metadata} from "next";
import "./globals.css";
import {ReactNode} from "react";
import ReduxProvider from "@/app/ReduxProvider";
import Alert from "@/components/modals/Alert";


export const metadata: Metadata = {
  title: "EvoWay | Mua hàng nhanh chóng, thanh toán tiện lợi",
  description: "EvoWay - Nền tảng mua sắm và thanh toán trực tuyến hàng đầu, mang đến trải nghiệm mua sắm nhanh chóng và tiện lợi cho người dùng.",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
    <body className="font-sans max-w-[2560px] mx-auto min-h-screen bg-grey-c50">
    <ReduxProvider>
      <Alert/>
      {children}
    </ReduxProvider>
    </body>
    </html>
  );
}
