import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatPreview from '../components/ChatPreview'
import { FaBrain, FaBookOpen, FaUsers, FaBalanceScale } from 'react-icons/fa'

export default function Home(){
  const navigate = useNavigate()
  const [demoMode, setDemoMode] = useState(false)
  const previewRef = useRef(null)

  async function handleDemo(){
    // rola até o preview e então dispara a demo
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // pequeno delay para a rolagem começar — então dispara demo
    setTimeout(()=> setDemoMode(true), 420)
  }

  function onDemoComplete(){
    setDemoMode(false)
    // opcional: mantemos no preview
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="landing-root">
      <header className="landing-header container">
        <div className="logo">
          {/* ícone de balança do tribunal em branco */}
          <div aria-hidden style={{display:'flex',alignItems:'center'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{color:"#fff"}}
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
          <button className="btn ghost" onClick={()=>navigate('/login')}>Entrar</button>
          <button className="btn small" onClick={()=>navigate('/register')}>Registrar</button>
        </nav>
      </header>

      <main className="hero-section">
        <div className="hero-inner container">
          <div className="hero-left">
            <div className="hero-icon" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="64" height="64" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: "#fff" }}
                >
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
                    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
                    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
                    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
                    <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
                    <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
                    <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
                </svg>
            </div>

            <h1>SentryAI — IA Jurídica Avançada</h1>
            <h2 className="subtitle">Orientação jurídica acessível e confiável para trabalhadores brasileiros</h2>
            <p className="hero-desc">Uma plataforma social que usa IA especializada para interpretar legislação trabalhista e constitucional e oferecer orientações práticas.</p>

            <div className="hero-ctas">
              <button className="btn primary" onClick={()=>navigate('/app')}>Experimentar Agora</button>
              <button className="btn outline" onClick={handleDemo}>Ver Demo</button>
            </div>
            <p className="micro">Acesso demo sem login. <strong>Faça login</strong> para salvar seu histórico.</p>
          </div>

          {/* preview lateral removido conforme solicitado */}
        </div>
      </main>

      <section className="features container">
        <h3 style={{color:'var(--text)'}}>Como podemos te ajudar</h3>
        <p className="muted">Nossa plataforma oferece orientação jurídica acessível e confiável para todos</p>

        <div className="cards">
          <article className="card" aria-labelledby="card1-title">
            <div className="card-icon" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
                    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
                    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
                    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
                    <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
                    <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
                    <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
                </svg>
            </div>

            <h4 id="card1-title" style={{color:'var(--text)'}}>IA Jurídica Avançada</h4>
            <p className="muted">Orientação personalizada para análise de casos trabalhistas. Nossa IA analisa sua situação e oferece orientações baseadas na legislação vigente.</p>
            <button className="btn tiny">Saiba mais</button>
          </article>

          <article className="card" aria-labelledby="card2-title">
            <div className="card-icon" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="lucide lucide-book-open h-6 w-6 text-primary">
                    <path d="M12 7v14"></path>
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>
                </svg>
            </div>

            <h4 id="card2-title" style={{color:'var(--text)'}}>Explorar Direitos</h4>
            <p className="muted">Guias interativos e acesso livre: Direitos Trabalhistas; Direitos Constitucionais; Direitos da Mulher; Direitos do Consumidor. Conteúdo prático e sem necessidade de login.</p>
            <button className="btn tiny ghost">Explorar</button>
          </article>

          <article className="card" aria-labelledby="card3-title">
            <div className="card-icon" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="lucide lucide-users h-6 w-6 text-primary">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>

            <h4 id="card3-title" style={{color:'var(--text)'}}>Acesso Democrático</h4>
            <p className="muted">Orientação jurídica gratuita para todos os trabalhadores. Quebrando barreiras e democratizando o acesso ao conhecimento jurídico.</p>
            <button className="btn tiny">Nossa Missão</button>
          </article>
        </div>
      </section>

      <section className="tech-advanced container">
        <div className="tech-left">
          <span className="eyebrow">Tecnologia Avançada</span>
          <h3 style={{color:'var(--text)'}}>IA que entende direito trabalhista</h3>
          <p className="muted">Nossa inteligência artificial foi treinada especificamente em legislação trabalhista e constitucional brasileira, oferecendo respostas precisas e atualizadas.</p>

          <div className="two-col">
            <ul>
              <li className="muted"><strong style={{color:'var(--text)'}}>Análise de Contratos</strong> — Identifica cláusulas abusivas automaticamente</li>
              <li className="muted"><strong style={{color:'var(--text)'}}>Orientação Personalizada</strong> — Respostas baseadas no seu caso específico</li>
            </ul>
            <ul>
              <li className="muted"><strong style={{color:'var(--text)'}}>Histórico Salvo</strong> — Mantenha suas consultas sempre acessíveis</li>
              <li className="muted"><strong style={{color:'var(--text)'}}>Treinamento Localizado</strong> — Modelo treinado com legislação brasileira</li>
            </ul>
          </div>

          <div className="tech-ctas">
            <button className="btn small primary" onClick={()=>navigate('/login')}>Fazer Login e Testar</button>
          </div>
        </div>

        <div className="tech-right">
          <div className="example-card" role="region" aria-label="Exemplo de consulta">
            <h4 style={{color:'var(--text)'}}>Meu empregador não está pagando horas extras. O que posso fazer?</h4>
            <p className="muted">Baseado na CLT, art. 59, você tem direito ao pagamento de horas extras com adicional mínimo de 50%. Recomendamos documentar as horas e procurar orientação no sindicato.</p>
            <div className="example-ctas">
              <button className="btn tiny primary" onClick={()=>navigate('/app')}>Experimentar Chat</button>
              <button className="btn tiny ghost" onClick={()=>setDemoMode(true)}>Ver Detalhes</button>
            </div>
          </div>
        </div>
      </section>

      <section className="preview-section container" ref={previewRef}>
        <div className="preview-left">
          <h3 style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="galaxy" style={{ display: 'flex' }}>
                {/* SVG Sparkles */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="lucide lucide-sparkles"
                style={{ color: 'var(--accent)' }}>
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
                </svg>
            </span>

            Veja o chat em ação
        </h3>

          <p className="muted">Experimente uma demonstração interativa de como nossa IA jurídica responde às suas dúvidas. Respostas claras, práticas e baseadas na legislação brasileira.</p>

          <div style={{marginTop:12}}>
            <p className="muted"><strong style={{color:'var(--text)'}}>Respostas Instantâneas</strong> — Orientação em tempo real, 24/7</p>
            <p className="muted"><strong style={{color:'var(--text)'}}>IA Especializada</strong> — Treinada em direito trabalhista e constitucional</p>
            <p className="muted"><strong style={{color:'var(--text)'}}>Orientação Personalizada</strong> — Passos práticos conforme seu caso</p>
            <p className="muted"><strong style={{color:'var(--text)'}}>Privacidade</strong> — Suas consultas ficam protegidas (quando logado)</p>
          </div>

          <div className="preview-ctas" style={{marginTop:16}}>
            <button className="btn primary" onClick={()=>navigate('/app')}>Experimentar Agora</button>
            <button className="btn outline" onClick={handleDemo}>Ver Demo</button>
          </div>

          <p className="hint muted" style={{marginTop:12}}>Dica: Faça login para salvar seu histórico e acompanhar suas consultas</p>
        </div>

        <div className="preview-right">
          <div className="preview-card" role="region" aria-label="Preview do chat">
            <h4 style={{color:'var(--text)'}}>Chat Sentry AI — Preview</h4>
            {/* allowInput=false para não permitir envio manual aqui */}
            <ChatPreview demo={demoMode} allowInput={false} onDemoComplete={onDemoComplete} />
          </div>
        </div>
      </section>

      <section className="tech-badges container">
        <h4 style={{color:'var(--text)'}}>Tecnologias</h4>
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
              <div aria-hidden style={{display:'flex',alignItems:'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{color:"#fff"}}
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
    </div>
  )
}