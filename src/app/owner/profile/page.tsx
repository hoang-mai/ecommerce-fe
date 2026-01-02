import type { Metadata } from 'next';
import Main from "@/components/owner/profile/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Owner Profile',
  description: 'Quản lý thông tin chủ cửa hàng',
};

export default function Page(){
  return <Main/>;
}