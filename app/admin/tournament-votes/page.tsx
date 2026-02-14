'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTournamentVotesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=votes');
  }, [router]);

  return null;
}
