import "../styles/football.css";
import "../styles/teams.css";
import "../styles/footballapp.css";
import type { AppProps } from "next/app";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../contexts/ThemeContext";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from '@clerk/nextjs'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <Component {...pageProps} />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}

export default MyApp;
