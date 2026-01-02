import type { Metadata } from 'next';
import Main from "@/components/user/search/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Tìm kiếm sản phẩm',
  description: 'Tìm kiếm sản phẩm và cửa hàng trên EvoWay',
};

export default function Page(){
  return <Main/>;
}