import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

export const { handlers: { GET, POST } } = NextAuth(authOptions)

// Export auth function for use in other parts of the app
export const auth = NextAuth(authOptions)