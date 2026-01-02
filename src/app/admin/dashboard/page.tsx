import type { Metadata } from 'next';
import Main from "@/components/admin/dashboard/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Admin Dashboard',
  description: 'Tổng quan quản trị hệ thống',
};

export default function Page(){
  return <Main/>;
}