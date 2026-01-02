import type { Metadata } from 'next';
import Main from "@/components/auth/privacy/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Chính sách bảo mật',
  description: 'Chính sách bảo mật thông tin người dùng',
};

export default function Page(){
  return <Main/>
}