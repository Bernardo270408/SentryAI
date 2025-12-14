import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'; 
import { motion } from 'framer-motion'; // Importação do Framer Motion
import '../styles/footer.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  },
  hover: { 
    scale: 1.1, 
    backgroundColor: "rgba(74, 144, 226, 0.2)",
    borderColor: "#4A90E2",
    color: "#4A90E2",
    cursor: "default"
  }
};

const socialVariants = {
  hover: { x: 5, color: "#fff", transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const FooterContent = () => (
    <>
      <motion.section 
        className="tech-badges container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <h4 style={{ color: 'var(--text)' }}>Tecnologias</h4>
        <div className="badges">
          {['React', 'Flask', 'MySQL', 'GPT-5', 'Gemini 3 Pro'].map((tech) => (
            <motion.span 
              key={tech} 
              className="badge" 
              variants={badgeVariants}
              whileHover="hover"
            >
              {tech}
            </motion.span>
          ))}
        </div>
        <motion.p 
            className="muted small"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
            Arquitetura moderna para desempenho, privacidade e escalabilidade.
        </motion.p>
      </motion.section>
  
      <motion.footer 
        className="site-footer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
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
                
                {/* Link do GitHub */}
                <motion.a 
                    href="https://github.com/Bernardo270408/SentryAI" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="GitHub" 
                    className="muted footer-link social-link-item"
                    variants={socialVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <FaGithub size={18} /> 
                    <span>GitHub</span>
                </motion.a>

                {/* Placeholders com ícones para manter o padrão */}
                <motion.a 
                    aria-label="Twitter" 
                    href="#" 
                    role="listitem" 
                    className="muted footer-link social-link-item"
                    variants={socialVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <FaTwitter size={18} />
                    <span>Twitter</span>
                </motion.a>
                <motion.a 
                    aria-label="LinkedIn" 
                    href="#" 
                    role="listitem" 
                    className="muted footer-link social-link-item"
                    variants={socialVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <FaLinkedin size={18} />
                    <span>LinkedIn</span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>
  
        <div className="footer-bottom">
          <small className="muted">© 2025 Sentry AI. Projeto social dedicado à democratização do conhecimento jurídico.</small>
          <small className="muted">Informação orientativa, não substitui advogado.</small>
        </div>
      </motion.footer>
    </>
);

export default FooterContent;