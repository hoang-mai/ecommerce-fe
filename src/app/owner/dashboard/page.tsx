import type { Metadata } from 'next';
import Main from "@/components/owner/dashboard/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Owner Dashboard',
  description: 'Tổng quan cửa hàng của bạn',
};

export default function Page(){
  return <Main/>;
}