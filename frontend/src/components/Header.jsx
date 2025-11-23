import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from './AuthModal'

export default function Header({ onLogout }){
  const user = JSON.parse(localStorage.getItem('user')||'null')
  const [authOpen, setAuthOpen] = useState(false)
  const [initialTab, setInitialTab] = useState('login')
  const navigate = useNavigate()

  function openAuth(tab = 'login') {
    setInitialTab(tab)
    setAuthOpen(true)
  }

  return (
    <>
      <header className="app-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 20px',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 9h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <div style={{fontWeight:600}}>Sentry AI</div>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {!user ? (
            <>
              <button className="btn ghost" onClick={()=>openAuth('login')}>Entrar</button>
              <button className="btn small" onClick={()=>openAuth('register')}>Registrar</button>
            </>
          ) : (
            <>
              <div style={{marginRight:8}} className="user-info">
                <div className="user-name">{user?.name}</div>
              </div>
              <button className="link" onClick={onLogout}>Sair</button>
            </>
          )}
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={initialTab}
      />
    </>
  )
}