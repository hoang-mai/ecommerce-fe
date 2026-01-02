import type { Metadata } from 'next';
import Main from "@/components/admin/shops/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Admin Shops',
  description: 'Quản lý cửa hàng',
};

export default function Page(){
  return <Main/>;
}