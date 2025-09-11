import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add role to request
    if (req.nextauth.token?.role) {
      req.nextauth.token.role = req.nextauth.token.role
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}