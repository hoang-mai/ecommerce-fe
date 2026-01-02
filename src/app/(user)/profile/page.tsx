import type { Metadata } from 'next';
import Main from "@/components/user/profile/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Hồ sơ của tôi',
  description: 'Xem và chỉnh sửa thông tin cá nhân của bạn',
};

export default function Page(){
  return <Main/>;
}