import "../styles/football.css";
import "../styles/teams.css";
import "../styles/footballapp.css";
import type { AppProps } from "next/app";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { SessionProvider } from 'next-auth/react'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <ThemeProvider>
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
}

export default MyApp;
