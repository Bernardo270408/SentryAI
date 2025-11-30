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
          <small className="muted">© 2025 Sentry AI. Projeto social dedicado à democratização do conhecimento jurídico.</small>
          <small className="muted">Informação orientativa, não substitui advogado.</small>
        </div>
      </footer>
    </>
);

export default FooterContent;