'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export default function SignInPage() {
  const handleSignIn = async (provider: string) => {
    await signIn(provider, { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full mx-4">
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome to Football Club
            </h1>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
              Sign in or create an account to register for matches
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              New users will automatically have an account created
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Sign In */}
            <button
              onClick={() => handleSignIn('google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50
                         text-gray-800 font-medium rounded-lg border border-gray-300
                         transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub Sign In */}
            <button
              onClick={() => handleSignIn('github')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800
                         text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </button>

            {/* 42 School Sign In
            <button
              onClick={() => handleSignIn('42-school')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-ft-primary hover:bg-ft-secondary
                         text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.42L23.998 0L0 0.002V24h11.996v-5.868H6.13v-5.796h5.865V6.572h5.866v5.764h-5.866v5.796H24V12.42z"/>
              </svg>
              <span>Continue with 42 School</span>
            </button> */}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              ← Back to Home
            </Link>
          </div>

          <div className="mt-6 p-4 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-center font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              ℹ️ First time here?
            </p>
            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              Choose any provider above to create your account automatically.
              If you use multiple providers with the same email, they will be linked to one account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
