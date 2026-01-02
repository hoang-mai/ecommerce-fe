import type { Metadata } from 'next';
import Main from "@/components/admin/register-owners/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Đăng ký chủ cửa hàng',
  description: 'Xem và phê duyệt đăng ký chủ cửa hàng',
};

export default function Page(){
  return <Main/>;
}