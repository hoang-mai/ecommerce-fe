import type { Metadata } from 'next';
import Main from "@/components/auth/terms/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Điều khoản',
  description: 'Điều khoản dịch vụ của EvoWay',
};

export default function Page(){
  return <Main/>
}