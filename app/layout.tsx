import "../styles/globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TournamentAudioProvider } from "../contexts/TournamentAudioContext";
import { QueryProvider } from "../providers/QueryProvider";
import { SessionProvider } from "../providers/SessionProvider";
import { SiteConfigProvider } from "../contexts/SiteConfigContext";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import { Big_Shoulders, Instrument_Sans } from "next/font/google"

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  variable: "--font-bigshoulders",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${instrumentSans.variable}`}>
      <body>
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              <SiteConfigProvider>
              <ThemeProvider>
              <TournamentAudioProvider>
                {children}
                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                  toastOptions={{
                    unstyled: false,
                    classNames: {
                      toast: 'toast-sonner',
                      title: 'toast-title',
                      description: 'toast-description',
                      actionButton: 'toast-action',
                      cancelButton: 'toast-cancel',
                      closeButton: 'toast-close',
                    },
                  }}
                />
                <Analytics />
                <SpeedInsights />
              </TournamentAudioProvider>
              </ThemeProvider>
              </SiteConfigProvider>
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}