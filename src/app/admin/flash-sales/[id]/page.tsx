'use client';
import Main from '@/components/admin/flash-sales/[id]/Main'
import {useParams} from 'next/navigation';

export default function Page() {
  const params = useParams<{ id: string }>()
  return (
    <Main id={params.id}/>
  );
}