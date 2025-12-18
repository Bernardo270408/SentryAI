import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Scale, 
  BookOpen, 
  Users, 
  Bot, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  MessageSquare, 
  Sparkles,
  Layout
} from 'lucide-react'
import ChatPreview from '../components/ChatPreview'
import FooterContent from '../components/FooterComponent'

// Variantes de animação
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const scaleOnHover = {
  hover: { scale: 1.03, transition: { duration: 0.2 } }
}

export default function Home() {
  const navigate = useNavigate()
  const [demoMode, setDemoMode] = useState(false)
  const [setAuthOpen] = useState(false)
  const [setInitialTab] = useState('login')
  const previewRef = useRef(null)
  const user = JSON.parse(localStorage.getItem("user"));

  async function handleDemo() {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setDemoMode(true), 420)
  }

  function onDemoComplete() {
    setDemoMode(false)
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function openAuth(tab = 'login') {
    setInitialTab(tab)
    setAuthOpen(true)
  }

  function shouldOpenAuth(user, param){
    if(!user){
      openAuth(param);
    }
    else{
      navigate('/app');
    }
  }

  return (
    <div className="landing-root" style={{ position: 'relative' }}>

      {/* HERO SECTION */}
      <main className="hero-section" style={{ paddingTop: 40 }}> {/* Ajuste de padding top para compensar o header */}
        <div className="hero-inner container" style={{ alignItems: 'center' }}>
          <motion.div 
            className="hero-left" 
            style={{ paddingRight: 40 }}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="badge-pill" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20, 
              background: 'rgba(74, 144, 226, 0.1)', border: '1px solid rgba(74, 144, 226, 0.2)',
              color: '#4A90E2', fontSize: 13, fontWeight: 500, marginBottom: 24
            }}>
              <Sparkles size={14} /> Gemini 3 Pro
            </motion.div>

            <motion.h1 variants={fadeInUp} style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: 20 }}>
              SentryAI <br />
              <span style={{ 
                background: 'linear-gradient(90deg, #fff, #a0a0a0)', 
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
              }}>
                Justiça Acessível
              </span>
            </motion.h1>
            
            <motion.h2 variants={fadeInUp} className="subtitle" style={{ fontSize: '1.25rem', maxWidth: 540, lineHeight: 1.6 }}>
              Orientação jurídica confiável para trabalhadores brasileiros. 
              Interpretação precisa da CLT e Constituição com Inteligência Artificial.
            </motion.h2>

            <motion.div variants={fadeInUp} className="hero-ctas" style={{ marginTop: 32 }}>
              <motion.button 
                className="btn primary" 
                onClick={() => shouldOpenAuth(user,'register')} 
                style={{ padding: '12px 24px', fontSize: 15 }}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                Começar Agora
              </motion.button>
              <motion.button 
                className="btn outline" 
                onClick={handleDemo} 
                style={{ padding: '12px 24px', fontSize: 15, display: 'flex', gap: 8, alignItems: 'center' }}
                whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Bot size={18} /> Ver Demonstração
              </motion.button>
            </motion.div>
            
            <motion.p variants={fadeInUp} className="micro" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.6 }}>
              <Shield size={14} color="#50E3C2" /> Seus dados estão seguros e criptografados.
            </motion.p>
          </motion.div>
          
        </div>
      </main>
      
      {/* FEATURES SECTION */}
      <section className="features container">
        <motion.div 
          style={{ textAlign: 'center', marginBottom: 50 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 style={{ fontSize: 28, marginBottom: 12, color: 'var(--text)' }}>Como podemos te ajudar</h3>
          <p className="muted" style={{ maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
            Nossa plataforma combina tecnologia avançada com conhecimento jurídico especializado para democratizar o acesso à justiça.
          </p>
        </motion.div>

        <motion.div 
          className="cards"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.article className="card" variants={fadeInUp} whileHover="hover">
            <motion.div variants={scaleOnHover} className="card-icon" style={{ color: '#4A90E2', background: 'rgba(74, 144, 226, 0.1)' }}>
              <Bot size={24} />
            </motion.div>
            <h4 style={{ fontSize: 18, marginTop: 4 }}>Análise Jurídica IA</h4>
            <p>Nossa IA analisa seu caso com base na legislação vigente (CLT, CF) e oferece orientações práticas e personalizadas em segundos.</p>
            <button className="btn tiny ghost" onClick={() => navigate('/app')} style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Saiba mais</button>
          </motion.article>

          <motion.article className="card" variants={fadeInUp} whileHover="hover">
            <motion.div variants={scaleOnHover} className="card-icon" style={{ color: '#50E3C2', background: 'rgba(80, 227, 194, 0.1)' }}>
              <BookOpen size={24} />
            </motion.div>
            <h4 style={{ fontSize: 18, marginTop: 4 }}>Explorar Direitos</h4>
            <p>Acesse guias interativos sobre Direitos Trabalhistas, Constitucionais e do Consumidor. Informação clara e acessível.</p>
            <button className="btn tiny ghost" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Explorar</button>
          </motion.article>

          <motion.article className="card" variants={fadeInUp} whileHover="hover">
            <motion.div variants={scaleOnHover} className="card-icon" style={{ color: '#F5A623', background: 'rgba(245, 166, 35, 0.1)' }}>
              <Users size={24} />
            </motion.div>
            <h4 style={{ fontSize: 18, marginTop: 4 }}>Acesso Democrático</h4>
            <p>Quebrando barreiras financeiras e técnicas. Orientação jurídica de qualidade disponível para todos os trabalhadores.</p>
            <button className="btn tiny ghost" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Nossa Missão</button>
          </motion.article>
        </motion.div>
      </section>

      {/* TECH / EXAMPLE SECTION */}
      <section className="tech-advanced container" style={{ alignItems: 'center', margin: '80px auto' }}>
        <motion.div 
          className="tech-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow" style={{ color: '#4A90E2', fontWeight: 600, letterSpacing: '1px' }}>TECNOLOGIA AVANÇADA</span>
          <h3 style={{ fontSize: 32, marginTop: 12, marginBottom: 16, color: 'var(--text)' }}>IA treinada na legislação brasileira</h3>
          <p className="muted" style={{ fontSize: 16, lineHeight: 1.7 }}>
            Utilizamos modelos de linguagem de última geração, ajustados especificamente com as leis brasileiras e jurisprudência atualizada para garantir precisão.
          </p>

          <div className="two-col" style={{ gap: 20 }}>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li className="muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <CheckCircle size={18} color="#50E3C2" strokeWidth={3} /> <strong style={{color: 'var(--text)'}}>Análise de Contratos</strong>
              </li>
              <li className="muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <CheckCircle size={18} color="#50E3C2" strokeWidth={3} /> <strong style={{color: 'var(--text)'}}>Orientação Personalizada</strong>
              </li>
            </ul>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <li className="muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <CheckCircle size={18} color="#50E3C2" strokeWidth={3} /> <strong style={{color: 'var(--text)'}}>Histórico Seguro</strong>
              </li>
              <li className="muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <CheckCircle size={18} color="#50E3C2" strokeWidth={3} /> <strong style={{color: 'var(--text)'}}>Jurisprudência Atual</strong>
              </li>
            </ul>
          </div>

          <div className="tech-ctas" style={{ marginTop: 36 }}>
            <motion.button 
              className="btn primary" 
              onClick={() => openAuth('login')} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Fazer Login e Testar <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="tech-right"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="example-card" role="region" aria-label="Exemplo de consulta" style={{
            background: 'var(--bg-800)', border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: 16
          }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ padding: 10, background: 'rgba(74, 144, 226, 0.1)', borderRadius: '50%' }}>
                <MessageSquare size={20} color="#4A90E2" />
              </div>
              <div>
                <strong style={{ fontSize: 14, color: '#fff', display: 'block' }}>Exemplo Real</strong>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Consulta Trabalhista</span>
              </div>
            </div>
            <h4 style={{ color: '#fff', fontSize: 17, marginBottom: 12 }}>"Meu empregador não está pagando horas extras..."</h4>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
              <strong style={{color: '#50E3C2'}}>SentryAI:</strong> Baseado no Art. 59 da CLT, você tem direito ao pagamento com adicional mínimo de 50%. A IA sugere documentar as horas e buscar o sindicato.
            </p>
            <div className="example-ctas">
              <button className="btn tiny primary" onClick={() => navigate('/app')}>Experimentar Chat</button>
              <button className="btn tiny ghost" onClick={() => setDemoMode(true)}>Ver no Preview</button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PREVIEW SECTION */}
      <motion.section 
        className="preview-section container" 
        ref={previewRef} 
        style={{ 
          padding: '60px 40px', 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)', 
          borderRadius: 24, 
          marginBottom: 60,
          border: '1px solid rgba(255,255,255,0.04)'
        }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="preview-left">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, color: 'var(--text)' }}>
            <div style={{ background: 'rgba(245, 166, 35, 0.1)', padding: 8, borderRadius: 8, display: 'flex' }}>
              <Zap size={24} color="#F5A623" />
            </div>
            Veja o SentryAI em ação
          </h3>

          <p className="muted" style={{ fontSize: 16, marginTop: 16, lineHeight: 1.6 }}>
            Experimente uma demonstração interativa de como nossa IA jurídica responde às suas dúvidas. Respostas claras, práticas e baseadas na legislação brasileira.
          </p>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <motion.div 
              style={{ display: 'flex', gap: 16 }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div style={{ marginTop: 2 }}><Layout size={20} color="#4A90E2" /></div>
              <div>
                <strong style={{ color: '#fff', fontSize: 15 }}>Interface Simples</strong>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>Design focado na sua dúvida, sem complicações desnecessárias.</p>
              </div>
            </motion.div>
            <motion.div 
              style={{ display: 'flex', gap: 16 }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div style={{ marginTop: 2 }}><Shield size={20} color="#50E3C2" /></div>
              <div>
                <strong style={{ color: '#fff', fontSize: 15 }}>Privacidade Total</strong>
                <p className="muted" style={{ margin: '4px 0 0', fontSize: 14 }}>Suas consultas e dados pessoais ficam protegidos (quando logado).</p>
              </div>
            </motion.div>
          </div>

          <div className="preview-ctas" style={{ marginTop: 40 }}>
            <motion.button 
              className="btn primary" 
              onClick={() => navigate('/app')} 
              style={{ padding: '12px 24px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Experimentar Agora
            </motion.button>
            <motion.button 
              className="btn outline" 
              onClick={handleDemo} 
              style={{ padding: '12px 24px' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reiniciar Demo
            </motion.button>
          </div>
        </div>

        <motion.div 
          className="preview-right" 
          style={{ minHeight: 400 }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="preview-card" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <ChatPreview demo={demoMode} allowInput={false} onDemoComplete={onDemoComplete} />
          </div>
        </motion.div>
      </motion.section>

      <FooterContent />
      
    </div>
  )
}