import type { Metadata } from 'next';
import Main from "@/components/user/orders/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Đơn hàng của tôi',
  description: 'Danh sách và chi tiết các đơn hàng của bạn',
};

export default function Page(){
  return <Main/>;
}