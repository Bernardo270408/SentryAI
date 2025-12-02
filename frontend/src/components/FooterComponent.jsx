import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'; // Importando ícones
import '../styles/footer.css';

const FooterContent = () => (
    <>
      <section className="tech-badges container">
        <h4 style={{ color: 'var(--text)' }}>Tecnologias</h4>
        <div className="badges">
          <span className="badge">React</span>
          <span className="badge">Flask</span>
          <span className="badge">MySQL</span>
          <span className="badge">GPT-5</span>
          <span className="badge">Gemini 2.5 Pro</span>
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
                <li>IA Jurídica</li>
                <li>Explorar Direitos</li>
                <li><Link to="/knowledge-base" className="muted footer-link">Base de Conhecimento</Link></li>
                <li><Link to="/docs" className="muted footer-link">Documentação</Link></li>
              </ul>
            </div>
            <div>
              <h5>Legal</h5>
              <ul>
                <li><Link to="/terms" className="muted footer-link">Termos de Uso</Link></li>
                <li><Link to="/privacy" className="muted footer-link">Política de Privacidade</Link></li>
                <li><Link to="/disclaimer" className="muted footer-link">Disclaimer</Link></li>
              </ul>
            </div>
            <div>
              <h5>Conecte-se</h5>
              <div className="socials" role="list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Link do GitHub Atualizado */}
                <a 
                    href="https://github.com/Bernardo270408/SentryAI" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="GitHub" 
                    className="muted footer-link social-link-item"
                >
                    <FaGithub size={18} /> 
                    <span>GitHub</span>
                </a>

                {/* Placeholders com ícones para manter o padrão */}
                <a aria-label="Twitter" href="#" role="listitem" className="muted footer-link social-link-item">
                    <FaTwitter size={18} />
                    <span>Twitter</span>
                </a>
                <a aria-label="LinkedIn" href="#" role="listitem" className="muted footer-link social-link-item">
                    <FaLinkedin size={18} />
                    <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
  
        <div className="footer-bottom">
          <small className="muted">© 2025 Sentry AI. Projeto social dedicado à democratização do conhecimento jurídico.</small>
          <small className="muted">Informação orientativa, não substitui advogado.</small>
        </div>
      </footer>
    </>
);

export default FooterContent;