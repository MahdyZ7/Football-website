import "../styles/globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { ThemeProvider } from "../contexts/ThemeContext";
import { QueryProvider } from "../providers/QueryProvider";
import { SessionProvider } from "../providers/SessionProvider";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              <ThemeProvider>
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
              </ThemeProvider>
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}