import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Home from './home';
import FootballApp from './althome'; 

export default function Index() {
  const { data: session, status } = useSession();
  const [showHome, setShowHome] = useState(true); // Default to Home for SSR
  const [isClient, setIsClient] = useState(false);
  const isLoading = status === 'loading';

  useEffect(() => {
    setIsClient(true);
    // Only run random selection on client side
    setShowHome(Math.random() < 0.9);
  }, []);

  // Show loading during authentication check
  if (isLoading || !isClient) {
    return <Home />;
  }

  if (!session) {
    return (
      <div className="container">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>
            42 Football Registration
          </h1>
          <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
            Please sign in to access the registration system
          </p>
          <button 
            onClick={() => signIn()}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              width: '200px',
              background: 'var(--ft-primary)',
              color: 'white'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem' }}>
            {session.user?.name || session.user?.email}
          </span>
          <button 
            onClick={() => signOut()}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'var(--ft-secondary)',
              color: 'white'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
      {showHome ? <Home /> : <FootballApp />}
    </>
  );
}