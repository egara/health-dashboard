'use client';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import './Sidebar.css';

export default function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Health Dashboard</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className="active"><Link href="/">Workouts</Link></li>
          <li><Link href="/">Overview</Link></li>
          <li><Link href="/">Metrics</Link></li>
          <li><Link href="/">Settings</Link></li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        {session ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
            <button className="login-btn" onClick={() => signOut()}>Sign out</button>
          </div>
        ) : (
          <Link href="/api/auth/signin" className="login-btn" style={{ display: 'block', textAlign: 'center' }}>
            Sign in with Google
          </Link>
        )}
      </div>
    </aside>
  );
}
