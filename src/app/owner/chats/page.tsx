import type { Metadata } from 'next';
import Main from "@/components/owner/chats/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Tin nhắn',
  description: 'Quản lý tin nhắn giữa chủ cửa hàng và khách hàng',
};

export default function Page(){
  return <Main/>;
}