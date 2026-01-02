import type { Metadata } from 'next';
import Main from "@/components/owner/notifications/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Thông báo',
  description: 'Xem các thông báo liên quan đến cửa hàng',
};

export default function Page(){
    return <Main/>;
}