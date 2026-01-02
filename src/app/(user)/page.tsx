import type { Metadata } from 'next';
import Main from "@/components/user/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Trang chủ',
  description: 'Mua sắm nhanh chóng và tiện lợi tại EvoWay',
};

export default function Page() {
  return <Main/>;
}
