import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

export default function App(){
  const navigate = useNavigate()
  function handleLogout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }
  return (
    <div className="app-root">
      <Header onLogout={handleLogout} />
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
