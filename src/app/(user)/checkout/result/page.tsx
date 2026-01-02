import type { Metadata } from 'next';
import Main from "@/components/user/checkout/result/Main";


export const metadata: Metadata = {
  title: 'EvoWay | Kết quả thanh toán',
  description: 'Kết quả đơn hàng và thông tin thanh toán',
};

export default function Page() {


  return <Main/>;
}