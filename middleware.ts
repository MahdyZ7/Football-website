import { withAuth } from 'next-auth/middleware'

// NextAuth middleware - protects routes that require authentication
// Note: Most protection is handled at component/page level
// This middleware can be used for API routes that need global protection
export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
    return
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow all requests by default since protection is handled at component level
        // You can add specific route protection logic here if needed
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}