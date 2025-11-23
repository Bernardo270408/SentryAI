import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <nav>
        <Link to="/">Conversas</Link>
        <Link to="/">Comunidade</Link>
        <a href="#">Documentos</a>
        <a href="#">Configurações</a>
      </nav>
      <div className="sidebar-footer muted">Plataforma jurídica colaborativa</div>
    </aside>
  )
}
