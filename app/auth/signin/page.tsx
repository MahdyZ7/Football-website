'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

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
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.95c-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
              </svg>
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
