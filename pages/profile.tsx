import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useRoleAuth } from '../hooks/useRoleAuth';
import Image from 'next/image';
import Navbar from './Navbar';
import RoleGuard from '../components/RoleGuard';

interface LinkedAccount {
  provider: string;
  providerAccountId: string;
  type: string;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const { role, isAdmin } = useRoleAuth();
  const router = useRouter();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    if (status !== 'loading' && !session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      if (session) {
        try {
          const response = await fetch('/api/user/accounts');
          if (response.ok) {
            const data = await response.json();
            setLinkedAccounts(data.linkedAccounts);
          }
        } catch (error) {
          console.error('Error fetching linked accounts:', error);
        } finally {
          setLoadingAccounts(false);
        }
      }
    };

    fetchLinkedAccounts();
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-var(--bg-primary)">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-var(--ft-primary) mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getProviderInfo = (provider: string) => {
    const providers = {
      'google': { name: 'Google', icon: '🔍', color: 'text-red-600' },
      'github': { name: 'GitHub', icon: '🐱', color: 'text-gray-800' },
      '42-school': { name: '42 School', icon: '🎓', color: 'text-blue-600' },
    };
    return providers[provider as keyof typeof providers] || { name: provider, icon: '🔐', color: 'text-gray-600' };
  };

  return (
    <RoleGuard>
      <div className="min-h-screen bg-var(--bg-primary)">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-var(--bg-card) rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-var(--text-primary) mb-6">
                Profile
              </h1>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {session?.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile"
					  width="64"
                      height="64"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-var(--text-primary)">
                      {session?.user?.name || 'Anonymous User'}
                    </h2>
                    <p className="text-var(--text-secondary)">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>

                <div className="border-t border-var(--border) pt-4">
                  <h3 className="text-lg font-medium text-var(--text-primary) mb-2">
                    Account Information
                  </h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-var(--text-secondary)">Role:</dt>
                      <dd className="text-var(--text-primary)">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isAdmin 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {role?.toUpperCase() || 'USER'}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-var(--text-secondary)">Account Status:</dt>
                      <dd className="text-green-600">Active</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-var(--text-secondary)">Provider:</dt>
                      <dd className="text-var(--text-primary)">
                        {/* Get provider from session accounts if needed */}
                        OAuth
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border-t border-var(--border) pt-4">
                  <h3 className="text-lg font-medium text-var(--text-primary) mb-2">
                    Linked Accounts
                  </h3>
                  {loadingAccounts ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-var(--ft-primary)"></div>
                      <span className="ml-2 text-sm text-var(--text-secondary)">Loading accounts...</span>
                    </div>
                  ) : linkedAccounts.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-var(--text-secondary) mb-3">
                        You can sign in with any of these linked accounts:
                      </p>
                      {linkedAccounts.map((account, index) => {
                        const providerInfo = getProviderInfo(account.provider);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-var(--bg-secondary) rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{providerInfo.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-var(--text-primary)">
                                  {providerInfo.name}
                                </p>
                                <p className="text-xs text-var(--text-secondary)">
                                  Connected account
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${providerInfo.color} bg-opacity-10`}>
                              Linked
                            </span>
                          </div>
                        );
                      })}
                      <p className="text-xs text-var(--text-secondary) mt-2">
                        💡 Tip: You can sign in with any provider above using the same email address.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-var(--text-secondary)">
                      No additional accounts linked. You can sign in with different providers using the same email to link them automatically.
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <div className="border-t border-var(--border) pt-4">
                    <h3 className="text-lg font-medium text-var(--text-primary) mb-2">
                      Admin Access
                    </h3>
                    <p className="text-sm text-var(--text-secondary) mb-3">
                      You have administrator privileges for this application.
                    </p>
                    <button 
                      onClick={() => router.push('/admin')}
                      className="bg-var(--ft-primary) hover:bg-var(--ft-primary-hover) 
                               text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Go to Admin Panel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-var(--bg-card) rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-var(--text-primary) mb-4">
                Account Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white 
                           py-2 px-4 rounded-lg transition-colors"
                >
                  Back to Home
                </button>
                <button 
                  onClick={handleSignOut}
                  className="w-full bg-red-500 hover:bg-red-600 text-white 
                           py-2 px-4 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default ProfilePage;