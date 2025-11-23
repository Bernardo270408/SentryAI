import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatPreview from '../components/ChatPreview'
import AuthModal from '../components/AuthModal'
import { FaBrain, FaBookOpen, FaUsers, FaBalanceScale } from 'react-icons/fa'

export default function Home(){
  const navigate = useNavigate()
  const [demoMode, setDemoMode] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [initialTab, setInitialTab] = useState('login')
  const previewRef = useRef(null)

  async function handleDemo(){
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(()=> setDemoMode(true), 420)
  }

  function onDemoComplete(){
    setDemoMode(false)
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function openAuth(tab = 'login') {
    setInitialTab(tab)
    setAuthOpen(true)
  }

  return (
    <div className="landing-root">
          <header className="landing-header container">
              <div className="logo">
                  <div aria-hidden style={{ display: 'flex', alignItems: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ color: "#fff" }}
                      >
                          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                          <path d="M7 21h10"></path>
                          <path d="M12 3v18"></path>
                          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
                      </svg>
                  </div>

                  <div className="brand">
                      <strong>SentryAI</strong>
                      <span className="tag">IA Jurídica Avançada</span>
                  </div>
              </div>

              <nav className="top-nav">
                  <button className="btn ghost" onClick={() => openAuth('login')}>Entrar</button>
                  <button className="btn small" onClick={() => openAuth('register')}>Registrar</button>
              </nav>
          </header>

          {/* resto do Home permanece igual (copie tudo do seu Home) */}
          <main className="hero-section">
              <div className="hero-inner container">
                  <div className="hero-left">
                      <div className="hero-icon" aria-hidden>
                          {/* ... seu SVG e conteúdo como estava ... */}
                      </div>

                      <h1>SentryAI — IA Jurídica Avançada</h1>
                      <h2 className="subtitle">Orientação jurídica acessível e confiável para trabalhadores brasileiros</h2>
                      <p className="hero-desc">Uma plataforma social que usa IA especializada para interpretar legislação trabalhista e constitucional e oferecer orientações práticas.</p>

                      <div className="hero-ctas">
                          <button className="btn primary" onClick={() => navigate('/app')}>Experimentar Agora</button>
                          <button className="btn outline" onClick={handleDemo}>Ver Demo</button>
                      </div>
                      <p className="micro">Acesso demo sem login. <strong>Faça login</strong> para salvar seu histórico.</p>
                  </div>

                  {/* preview lateral removido conforme solicitado */}
              </div>
          </main>

          {/* ... restante do Home (features, preview, footer) permanece idêntico ao seu arquivo atual ... */}

          <section className="preview-section container" ref={previewRef}>
              <div className="preview-left">
                  <h3 style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="galaxy" style={{ display: 'flex' }}>
                          {/* Sparkles SVG */}
                      </span>
                      Veja o chat em ação
                  </h3>

                  <p className="muted">Experimente uma demonstração interativa de como nossa IA jurídica responde às suas dúvidas. Respostas claras, práticas e baseadas na legislação brasileira.</p>

                  <div style={{ marginTop: 12 }}>
                      <p className="muted"><strong style={{ color: 'var(--text)' }}>Respostas Instantâneas</strong> — Orientação em tempo real, 24/7</p>
                      <p className="muted"><strong style={{ color: 'var(--text)' }}>IA Especializada</strong> — Treinada em direito trabalhista e constitucional</p>
                      <p className="muted"><strong style={{ color: 'var(--text)' }}>Orientação Personalizada</strong> — Passos práticos conforme seu caso</p>
                      <p className="muted"><strong style={{ color: 'var(--text)' }}>Privacidade</strong> — Suas consultas ficam protegidas (quando logado)</p>
                  </div>

                  <div className="preview-ctas" style={{ marginTop: 16 }}>
                      <button className="btn primary" onClick={() => navigate('/app')}>Experimentar Agora</button>
                      <button className="btn outline" onClick={handleDemo}>Ver Demo</button>
                  </div>

                  <p className="hint muted" style={{ marginTop: 12 }}>Dica: Faça login para salvar seu histórico e acompanhar suas consultas</p>
              </div>

              <div className="preview-right">
                  <div className="preview-card" role="region" aria-label="Preview do chat">
                      <h4 style={{ color: 'var(--text)' }}>Chat Sentry AI — Preview</h4>
                      <ChatPreview demo={demoMode} allowInput={false} onDemoComplete={onDemoComplete} />
                  </div>
              </div>
          </section>

          {/* Footer (copie o footer original) */}
          <section className="tech-badges container">
              <h4 style={{ color: 'var(--text)' }}>Tecnologias</h4>
              <div className="badges">
                  <span className="badge">React</span>
                  <span className="badge">Flask</span>
                  <span className="badge">MySQL</span>
                  <span className="badge">ChatGPT-5</span>
              </div>
              <p className="muted small">Arquitetura moderna para desempenho, privacidade e escalabilidade.</p>
          </section>

          <footer className="site-footer">
              <div className="footer-inner">
                  <div className="brand-block">
                      <div className="logo-small" aria-hidden>
                          <div aria-hidden style={{ display: 'flex', alignItems: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                  style={{ color: "#fff" }}
                              >
                                  <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                                  <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
                                  <path d="M7 21h10"></path>
                                  <path d="M12 3v18"></path>
                                  <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
                              </svg>
                          </div>

                      </div>
                      <div>
                          <strong>Sentry AI</strong>
                          <div className="tagline muted">Democratizando o acesso à orientação jurídica através da inteligência artificial.</div>
                      </div>
                  </div>

                  <div className="footer-links">
                      <div>
                          <h5>Recursos</h5>
                          <ul>
                              <li className="muted">IA Jurídica</li>
                              <li className="muted">Explorar Direitos</li>
                              <li className="muted">Base de Conhecimento</li>
                              <li className="muted">Documentação</li>
                          </ul>
                      </div>
                      <div>
                          <h5>Legal</h5>
                          <ul>
                              <li className="muted">Termos de Uso</li>
                              <li className="muted">Política de Privacidade</li>
                              <li className="muted">Disclaimer</li>
                          </ul>
                      </div>
                      <div>
                          <h5>Conecte-se</h5>
                          <div className="socials" role="list">
                              <a aria-label="GitHub" href="#" role="listitem" className="muted">GH</a>
                              <a aria-label="Twitter" href="#" role="listitem" className="muted">TW</a>
                              <a aria-label="LinkedIn" href="#" role="listitem" className="muted">IN</a>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="footer-bottom">
                  <small className="muted">© 2024 Sentry AI. Projeto social dedicado à democratização do conhecimento jurídico.</small>
                  <small className="muted">Usuários devem ter 18 anos ou mais. Informação orientativa, não substitui advogado.</small>
              </div>
          </footer>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialTab={initialTab} />
    </div>
  )
}
