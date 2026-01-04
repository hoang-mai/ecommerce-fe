import type { Metadata } from 'next';
import Main from "@/components/user/cart/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Giỏ hàng của tôi',
  description: 'Danh sách và chi tiết giỏ hàng',
};

export default function Page(){
  return <Main/>;
}