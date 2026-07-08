'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import './Sidebar.css';

/**
 * Sidebar Component
 * Provides collapsible navigation links and handles user authentication state.
 * 
 * @returns {JSX.Element} The rendered Sidebar navigation component
 */
export default function Sidebar() {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'flex-end' }}>
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '➔' : '✕'}
        </button>
      </div>

      <div className="sidebar-profile">
        {session ? (
          <div className="user-profile">
            {session.user?.image && (
              <Image 
                src={session.user.image} 
                alt="Profile" 
                className="avatar" 
                width={isCollapsed ? 32 : 48} 
                height={isCollapsed ? 32 : 48} 
                style={{ borderRadius: '50%', transition: 'all 0.3s ease', cursor: 'pointer' }}
                onClick={() => signOut()}
              />
            )}
            <div className="user-info">
              <span className="user-name">{session.user?.name}</span>
              <button className="logout-btn" onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        ) : (
          !isCollapsed && (
            <Link href="/api/auth/signin" className="login-btn">
              Sign in
            </Link>
          )
        )}
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className="nav-item active">
          <span>💪</span> {!isCollapsed && <span>Workouts</span>}
        </Link>
      </nav>
    </aside>
  );
}
