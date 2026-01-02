import type { Metadata } from 'next';
import Main from "@/components/owner/orders/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Đơn hàng',
  description: 'Quản lý đơn hàng của cửa hàng',
};

export default function Page(){
    return <Main/>;
}