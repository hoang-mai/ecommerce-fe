import type { Metadata } from 'next';
import Main from "@/components/owner/flash-sales/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Flash Sale',
  description: 'Quản lý Flash Sale',
};

export default function Page(){
  return <Main/>;
}