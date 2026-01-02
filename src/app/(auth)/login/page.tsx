import type { Metadata } from 'next';
import {Main} from "@/components/auth/login/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Đăng nhập',
  description: 'Đăng nhập vào tài khoản EvoWay',
};

export default function Page(){
  return <Main/>
}