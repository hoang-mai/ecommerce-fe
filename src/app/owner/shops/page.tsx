import type { Metadata } from 'next';
import Main from "@/components/owner/shops/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Danh sách cửa hàng',
  description: 'Quản lý danh sách cửa hàng của bạn',
};

export default function Page(){
  return <Main/>;
}