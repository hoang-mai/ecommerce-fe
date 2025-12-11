'use client';
import Main from '@/components/owner/shops/[id]/[productId]/Main'
import {useParams} from 'next/navigation';

export default function Page() {
  const params = useParams<{ id: string; productId: string }>();
  return (
    <Main productId={params.productId}/>
  );
}