'use client';

import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const Journal = dynamic(() => import('@/react-frontend/src/pages/Journal'), {
  ssr: false,
});

export default function JournalPage() {
  return (
    <Layout>
      <Journal />
    </Layout>
  );
}
