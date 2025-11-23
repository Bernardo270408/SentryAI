import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    try{
      const data = await api.request('/login', 'POST', { email, password }, false)
      // expected { token, user }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    }catch(err){
      setError(err.body?.error || 'Erro ao autenticar')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Juridica</h1>
        <p className="muted">Plataforma jurídica — comunitária</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@exemplo.com" required />
          <label>Senha</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" required />
          <button type="submit" className="primary">Entrar</button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="footer-line">
          <span>Não tem conta? </span>
          <a href="/register">Registre-se</a>
        </div>
      </div>
    </div>
  )
}
