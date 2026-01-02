import type { Metadata } from 'next';
import Main from "@/components/user/checkout/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Thanh toán',
  description: 'Hoàn tất đơn hàng và thanh toán an toàn',
};

export default function Page(){
  return <Main/>;
}