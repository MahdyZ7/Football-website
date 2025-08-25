import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../Navbar';

const AuthError = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (router.query.error) {
      const error = router.query.error as string;
      
      switch (error) {
        case 'Configuration':
          setErrorMessage('There is a problem with the server configuration.');
          break;
        case 'AccessDenied':
          setErrorMessage('Access denied. You do not have permission to sign in.');
          break;
        case 'Verification':
          setErrorMessage('The verification token has expired or has already been used.');
          break;
        case 'Default':
        default:
          setErrorMessage('An error occurred during authentication. Please try again.');
          break;
      }
    }
  }, [router.query.error]);

  return (
    <div className="min-h-screen bg-var(--bg-primary)">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-var(--bg-card) p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Authentication Error
            </h1>
            <p className="text-var(--text-secondary) mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <button className="w-full bg-var(--ft-primary) hover:bg-var(--ft-primary-hover) 
                               text-white py-2 px-4 rounded-lg transition-colors">
                  Try Again
                </button>
              </Link>
              <Link href="/">
                <button className="w-full bg-gray-500 hover:bg-gray-600 text-white 
                               py-2 px-4 rounded-lg transition-colors">
                  Go Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError;