import type { Metadata } from 'next';
import Main from "@/components/owner/reviews/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Đánh giá',
  description: 'Xem và quản lý đánh giá của cửa hàng',
};

export default function Page(){
  return <Main/>;
}