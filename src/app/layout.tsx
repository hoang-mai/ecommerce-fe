import type {Metadata} from "next";
import "./globals.css";
import {ReactNode} from "react";
import ReduxProvider from "@/components/provider/ReduxProvider";
import Alert from "@/components/modals/Alert";
import WebSocketProvider from "@/components/provider/WebSocketProvider";
import {AxiosProvider} from "@/components/provider/AxiosProvider";
import WebPushProvider from "@/components/provider/WebPushProvider";


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
    <body className="font-sans max-w-[2560px] mx-auto bg-grey-c50">

    <ReduxProvider>
      <Alert/>
      <AxiosProvider>
        <WebSocketProvider>
          <WebPushProvider/>
          {children}
        </WebSocketProvider>
      </AxiosProvider>
    </ReduxProvider>

    </body>
    </html>
  );
}
