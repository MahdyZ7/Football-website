'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FaGoogle, FaGithub } from 'react-icons/fa';

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
              <FaGoogle className="text-xl text-red-500" />
              <span>Continue with Google</span>
            </button>

            {/* GitHub Sign In */}
            <button
              onClick={() => handleSignIn('github')}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800
                         text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm"
            >
              <FaGithub className="text-xl" />
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
