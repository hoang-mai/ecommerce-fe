import type { Metadata } from 'next';
import Main from "@/components/admin/users/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Admin Users',
  description: 'Quản lý người dùng hệ thống',
};

export default function Page(){
  return <Main/>;
}