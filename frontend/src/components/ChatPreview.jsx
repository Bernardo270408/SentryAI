import React, { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaRegUserCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Ícone SVG do Bot (Solicitado)
const BotIcon = ({ size = 24, color = "currentColor" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="lucide lucide-bot" 
    aria-hidden="true"
  >
    <path d="M12 8V4H8"></path>
    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
    <path d="M2 14h2"></path>
    <path d="M20 14h2"></path>
    <path d="M15 13v2"></path>
    <path d="M9 13v2"></path>
  </svg>
);

// Variantes de Animação
const messageVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const typingVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { repeat: Infinity, duration: 0.8, repeatType: "reverse" } }
};

/**
 * Props:
 * - allowInput (bool) : se false -> input visual mas desabilitado
 * - demo (bool) : quando true executa demo automática
 * - onDemoComplete (fn)
 */
export default function ChatPreview({ allowInput = false, demo = false, onDemoComplete }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Pronto para ver a mágica acontecer? Clique em "Ver Demo".' }
  ]);
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const demoRunning = useRef(false);

  useEffect(() => {
    // Scroll suave para o final sempre que as mensagens mudarem
    if (listRef.current) {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (demo && !demoRunning.current) {
      demoRunning.current = true;
      runDemo().then(() => {
        demoRunning.current = false;
        if (onDemoComplete) onDemoComplete();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  async function runDemo() {
    const seq = [
      { role: 'user', text: 'Meu empregador não está pagando horas extras.' },
      { role: 'assistant', text: 'Baseado na CLT, art. 59, você tem direito ao pagamento de horas extras com adicional mínimo de 50%.' },
      { role: 'user', text: 'Como devo documentar as horas?' },
      { role: 'assistant', text: 'Anote horários, guarde mensagens/e-mails, peça confirmação por escrito e procure o sindicato. Caso necessário, considere ação para diferenças salariais.' }
    ];

    // Reinicia para demo
    setMessages([{ id: Date.now(), role: 'assistant', text: 'Carregando demonstração...' }]);
    await sleep(700);

    for (const step of seq) {
      if (step.role === 'user') {
        add(step);
        await sleep(550);
      } else {
        // Mostra digitando
        const typingId = Date.now() + Math.random();
        setMessages(prev => [...prev, { id: typingId, role: 'assistant', text: '...', typing: true }]);
        await sleep(700 + Math.random() * 400);
        
        // Substitui digitando pela mensagem real
        setMessages(prev => prev.map(m => m.id === typingId ? { ...m, text: step.text, typing: false } : m));
        await sleep(550);
      }
    }
  }

  function add(msg) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function handleSend(e) {
    e?.preventDefault();
    if (!allowInput) return;
    const txt = value.trim();
    if (!txt) return;
    setValue('');
    setSending(true);
    add({ role: 'user', text: txt });
    await sleep(500);
    
    // Assistant typing simulation
    const tId = Date.now() + 1;
    setMessages(prev => [...prev, { id: tId, role: 'assistant', text: '...', typing: true }]);
    await sleep(900);
    setMessages(prev => prev.map(m => m.id === tId ? { ...m, text: `Simulação: recomenda-se documentar e procurar orientação. (resposta a: "${txt.slice(0,80)}")`, typing: false } : m));
    setSending(false);
  }

  return (
    <div className="chat-preview" role="region" aria-label="Preview do chat">
      <div ref={listRef} className="chat-messages" aria-live="polite">
        <AnimatePresence initial={false}>
            {messages.map(m => (
            <motion.div 
                key={m.id} 
                className={`msg ${m.role}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout // Anima o reposicionamento quando novos itens entram
            >
                <div className="avatar" aria-hidden>
                {m.role === 'assistant' ? (
                    <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center', background: 'rgba(74, 144, 226, 0.2)', padding: 6, borderRadius: '50%'}} aria-hidden>
                        <BotIcon size={20} color="#4A90E2" />
                    </div>
                ) : (
                    <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center'}} aria-hidden>
                        <FaRegUserCircle size={22} color="rgba(255,255,255,0.7)" />
                    </div>
                )}
                </div>

                <motion.div 
                    className="bubble" 
                    role="article" 
                    aria-label={`${m.role} message`}
                    layout
                >
                {m.typing ? (
                    <motion.div 
                        className="typing-dots" 
                        aria-hidden
                        variants={typingVariants}
                        initial="initial"
                        animate="animate"
                    >
                    <span>.</span><span>.</span><span>.</span>
                    </motion.div>
                ) : (
                    <div className="text">{m.text}</div>
                )}
                </motion.div>
            </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <form className="chat-input" onSubmit={handleSend} aria-hidden={!allowInput}>
        <input
          placeholder={allowInput ? "Digite sua dúvida jurídica aqui..." : "Faça login para usar o chat completo"}
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={!allowInput}
        />
        <motion.button
          type="submit"
          className="send"
          aria-label="Enviar"
          disabled={!allowInput || sending}
          title={allowInput ? "Enviar" : "Faça login para enviar"}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <FaPaperPlane />
        </motion.button>
      </form>
    </div>
  );
}