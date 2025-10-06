'use client';

import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const Settings = dynamic(() => import('@/react-frontend/src/pages/Settings'), {
  ssr: false,
});

export default function SettingsPage() {
  return (
    <Layout>
      <Settings />
    </Layout>
  );
}
