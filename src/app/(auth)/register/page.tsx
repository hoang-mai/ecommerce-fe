import type { Metadata } from 'next';
import Main from "@/components/auth/register/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Đăng ký',
  description: 'Tạo tài khoản mới trên EvoWay',
};

export default function Page() {
  return <Main/>
}