import "../styles/globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../contexts/ThemeContext";
import { TournamentAudioProvider } from "../contexts/TournamentAudioContext";
import { QueryProvider } from "../providers/QueryProvider";
import { SessionProvider } from "../providers/SessionProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"
import { Rajdhani, DM_Sans } from "next/font/google"

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${dmSans.variable}`}>
      <body className={dmSans.className}>
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
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
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}