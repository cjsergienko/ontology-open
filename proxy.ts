import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

function isPublic(pathname: string): boolean {
  if (pathname === '/' || pathname === '/login') return true
  if (pathname.startsWith('/api/auth')) return true
  return false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default auth(function middleware(req: NextRequest & { auth?: any }) {
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return NextResponse.next()

  // Google OAuth session
  if (req.auth?.user) return NextResponse.next()

  // Legacy PIN cookie (keeps e2e tests working)
  if (req.cookies.get('ontology_auth')?.value === '1') return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  return NextResponse.redirect(loginUrl)
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.ico|.*\\.jpg|.*\\.webp).*)'],
}
