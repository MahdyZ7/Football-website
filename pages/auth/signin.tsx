import { GetServerSideProps } from 'next';
import { getProviders, signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Navbar from '../Navbar';

interface Provider {
  id: string;
  name: string;
}

interface SignInPageProps {
  providers: Record<string, Provider>;
}

const SignInPage = ({ providers }: SignInPageProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { callbackUrl = '/' } = router.query;

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId);
    try {
      await signIn(providerId, {
        callbackUrl: callbackUrl as string,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(null);
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return '🔍';
      case 'github':
        return '🐱';
      case '42-school':
        return '🎓';
      default:
        return '🔐';
    }
  };

  return (
    <div className="min-h-screen bg-var(--bg-primary)">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-var(--bg-card) p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center mb-6 text-var(--text-primary)">
            Sign In to Football Club
          </h1>
          
          <div className="space-y-4">
            {Object.values(providers).map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleSignIn(provider.id)}
                disabled={isLoading !== null}
                className="w-full flex items-center justify-center gap-3 bg-var(--ft-primary) 
                         hover:bg-var(--ft-primary-hover) text-white py-3 px-4 rounded-lg 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl">{getProviderIcon(provider.id)}</span>
                {isLoading === provider.id ? (
                  <span>Signing in...</span>
                ) : (
                  <span>Continue with {provider.name}</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-var(--text-secondary)">
            <p>
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // If user is already signed in, redirect to home
  if (session) {
    return {
      redirect: {
        destination: context.query.callbackUrl as string || '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers: providers || {},
    },
  };
};

export default SignInPage;