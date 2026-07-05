'use client';
import { signIn } from 'next-auth/react';

export default function SignInButton() {
  return (
    <button 
      onClick={() => signIn('google')} 
      style={{
        padding: '1rem 2.5rem',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: '#fff',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, #2b6cb0 100%)',
        borderRadius: '12px',
        textDecoration: 'none',
        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer'
      }}
      className="login-btn-landing"
    >
      Sign in with Google <span>➔</span>
    </button>
  );
}
