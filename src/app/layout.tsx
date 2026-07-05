import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { Providers } from './providers'
import { Metadata } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyHealth Dashboard',
  description: 'Your personal health dashboard',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions) as any;
  const isAuthenticated = !!(session && session.accessToken);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="app-container" style={!isAuthenticated ? { display: 'block' } : undefined}>
            {isAuthenticated && <Sidebar />}
            <main className="main-content" style={!isAuthenticated ? { padding: 0, margin: 0, minHeight: '100vh' } : undefined}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
