'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification token has expired or has already been used.',
    OAuthSignin: 'Error in constructing an authorization URL.',
    OAuthCallback: 'Error in handling the response from the OAuth provider.',
    OAuthCreateAccount: 'Could not create OAuth provider user in the database.',
    EmailCreateAccount: 'Could not create email provider user in the database.',
    Callback: 'Error in the callback handler route.',
    OAuthAccountNotLinked: 'This account is already associated with another user.',
    EmailSignin: 'Check your email inbox.',
    CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
    SessionRequired: 'Please sign in to access this page.',
    Default: 'An unexpected error occurred.',
  }

    const errorMessage = error ? (errorMessages[error] ?? errorMessages.Default) : errorMessages.Default

	  return (
		<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-md w-full mx-4">
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Authentication Error
            </h1>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white
                           font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white
                           font-medium rounded-lg transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
