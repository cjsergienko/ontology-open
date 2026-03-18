import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      if (ALLOWED_EMAILS.length === 0) return false
      return ALLOWED_EMAILS.includes((user.email ?? '').toLowerCase())
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
