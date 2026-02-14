'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../pages/Navbar';
import Footer from '../pages/footer';
import { Skeleton } from '../Skeleton';
import { Button } from '../ui/Button';
import AdminUserManagement from './AdminUserManagement';
import AdminBannedUsers from './AdminBannedUsers';
import AdminFeedback from './AdminFeedback';
import AdminTournamentVotes from './AdminTournamentVotes';
import AdminLogsTab from './AdminLogs';

type TabKey = 'users' | 'banned' | 'feedback' | 'votes' | 'logs';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'users', label: 'Users' },
  { key: 'banned', label: 'Banned' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'votes', label: 'Votes' },
  { key: 'logs', label: 'Logs' },
];

const AdminDashboard: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabParam && TABS.some(t => t.key === tabParam) ? tabParam : 'users';

  const setActiveTab = (tab: TabKey) => {
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  // Loading state
  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="space-y-4">
                <Skeleton width="60%" height={32} />
                <Skeleton width="100%" height={48} />
                <Skeleton width="80%" height={24} />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not authorized
  if (!session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Admin Access Required
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                You must be signed in as an admin to access this page.
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button variant="primary">← Back to Home</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>

          {/* Back Link */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="primary">← Back to Registration</Button>
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto gap-2 mb-8 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 min-w-[100px] px-6 py-3 font-medium rounded transition-all duration-200 whitespace-nowrap"
                style={{
                  backgroundColor: activeTab === tab.key ? 'var(--ft-primary)' : 'var(--bg-secondary)',
                  color: activeTab === tab.key ? 'white' : 'var(--text-primary)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'banned' && <AdminBannedUsers />}
          {activeTab === 'feedback' && <AdminFeedback />}
          {activeTab === 'votes' && <AdminTournamentVotes />}
          {activeTab === 'logs' && <AdminLogsTab />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
