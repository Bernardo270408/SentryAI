import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    try{
      await api.request('/users/', 'POST', { name, email, password }, false)
      navigate('/login')
    }catch(err){
      setError(err.body?.error || 'Erro ao criar conta')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Registrar</h1>
        <form onSubmit={handleSubmit}>
          <label>Nome</label>
          <input value={name} onChange={e=>setName(e.target.value)} required />
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} required />
          <label>Senha</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button type="submit" className="primary">Criar conta</button>
          {error && <div className="error">{error}</div>}
        </form>
        <div className="footer-line">
          <span>Já tem conta? </span>
          <a href="/login">Entrar</a>
        </div>
      </div>
    </div>
  )
}
