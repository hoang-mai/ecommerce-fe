import type { Metadata } from 'next';
import Main from "@/components/user/flash-sale/Main";

export const metadata: Metadata = {
  title: 'EvoWay | Flash Sale',
  description: 'Flash Sale EvoWay – Săn deal hot, giảm giá cực sâu, số lượng có hạn.'
};

export default function Page(){
  return <Main/>;
}