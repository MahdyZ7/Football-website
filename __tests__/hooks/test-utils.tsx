/**
 * Test utilities for React hooks testing
 * Provides wrapper components and helper functions for testing hooks with React Testing Library
 */

import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

/**
 * Create a fresh QueryClient for each test
 * Prevents test pollution and ensures clean state
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: Infinity, // Keep cache indefinitely for testing
        staleTime: Infinity, // Never mark queries as stale
      },
      mutations: {
        retry: false, // Don't retry failed mutations in tests
      },
    },
  });
}

/**
 * Wrapper component that provides React Query context
 */
interface QueryWrapperProps {
  children: ReactNode;
}

export function QueryWrapper({ children }: QueryWrapperProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Wrapper component that provides both Session and React Query contexts
 */
interface AllProvidersProps {
  children: ReactNode;
  session?: any;
}

export function AllProviders({ children, session = null }: AllProvidersProps) {
  const queryClient = createTestQueryClient();
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

/**
 * Custom render function that wraps components with providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { session?: any }
) {
  const { session, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders session={session}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Mock session data for testing
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false,
  },
  expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
};

export const mockAdminSession = {
  user: {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    isAdmin: true,
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

/**
 * Helper to wait for async state updates
 */
export const waitForNextUpdate = () =>
  new Promise(resolve => setTimeout(resolve, 0));

/**
 * Helper to create mock localStorage
 */
export function createMockStorage() {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
}

/**
 * Setup mock localStorage before each test
 */
export function setupMockLocalStorage() {
  const mockStorage = createMockStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}
