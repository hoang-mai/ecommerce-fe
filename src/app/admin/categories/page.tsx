import type { Metadata } from 'next';
import Main from "@/components/admin/categories/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Admin Categories',
  description: 'Quản lý danh mục sản phẩm',
};

export default function Page(){
  return <Main/>;
}