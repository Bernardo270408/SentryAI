import React from 'react'

export default function Header({ onLogout }){
  const user = JSON.parse(localStorage.getItem('user')||'null')
  return (
    <header className="app-header">
      <div className="brand">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M6 9h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <div className="brand-text">Juridica</div>
      </div>
      <div className="header-actions">
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
        </div>
        <button className="link" onClick={onLogout}>Sair</button>
      </div>
    </header>
  )
}
