'use client';

import React, { createContext, useContext } from 'react';
import { useSiteConfig } from '../hooks/useQueries';
import { SiteConfig, DEFAULT_CONFIG } from '../lib/config/defaults';

interface SiteConfigContextValue {
  config: SiteConfig;
  isLoading: boolean;
  version: number;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: DEFAULT_CONFIG,
  isLoading: true,
  version: 0,
});

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useSiteConfig();

  const value: SiteConfigContextValue = {
    config: data?.config ?? DEFAULT_CONFIG,
    isLoading,
    version: data?.version ?? 0,
  };

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useConfig(): SiteConfigContextValue {
  return useContext(SiteConfigContext);
}
