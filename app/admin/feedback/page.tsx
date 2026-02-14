'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminFeedbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=feedback');
  }, [router]);

  return null;
}
