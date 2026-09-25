'use client';

import { Suspense } from 'react';
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react';
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
		<div className="min-h-screen flex items-center justify-center paper">
      <div className="max-w-md w-full mx-4">
        <div className="rounded-lg border p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div>
            <AlertTriangle size={32} aria-hidden="true" style={{ color: 'var(--danger)' }} />
            <h1 className="ds-title text-[2.5rem] mt-4">
              Sign-in didn&apos;t work
            </h1>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full text-center px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white
                           font-semibold rounded-md transition-colors"
              >
                Try again
              </Link>
              <Link
                href="/"
                className="block w-full text-center px-6 py-3 rounded-md font-semibold transition-colors
                           border-[1.5px] border-[var(--border-color)] hover:border-[var(--text-primary)] text-[var(--text-primary)]"
              >
                Back to home
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
