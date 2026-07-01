'use client';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import './Sidebar.css';

export default function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Health Dash</h2>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item active">
          Entrenamientos
        </Link>
        <Link href="#" className="nav-item">
          Sueño (Próximamente)
        </Link>
        <Link href="#" className="nav-item">
          Nutrición (Próximamente)
        </Link>
      </nav>
      <div className="sidebar-footer">
        {session ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logueado como {session.user?.name}</span>
            <button className="login-btn" onClick={() => signOut()}>Desconectar</button>
          </div>
        ) : (
          <Link href="/api/auth/signin" className="login-btn" style={{ display: 'block', textAlign: 'center' }}>
            Conectar con Google
          </Link>
        )}
      </div>
    </aside>
  );
}
