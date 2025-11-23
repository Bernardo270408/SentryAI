import React, { useEffect, useRef, useState } from 'react'
import { FaPaperPlane, FaRegUserCircle } from 'react-icons/fa'
import { GiArtificialIntelligence } from 'react-icons/gi'

/**
 * Props:
 *  - allowInput (bool) : se false -> input visual mas desabilitado
 *  - demo (bool) : quando true executa demo automática
 *  - onDemoComplete (fn)
 */
export default function ChatPreview({ allowInput = false, demo = false, onDemoComplete }) {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Pronto para ver a mágica acontecer? Clique em "Ver Demo".' }
  ])
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const demoRunning = useRef(false)

  useEffect(() => {
    // scroll bottom on change
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (demo && !demoRunning.current) {
      demoRunning.current = true
      runDemo().then(() => {
        demoRunning.current = false
        if (onDemoComplete) onDemoComplete()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo])

  async function runDemo() {
    // sequence example
    const seq = [
      { role: 'user', text: 'Meu empregador não está pagando horas extras.' },
      { role: 'assistant', text: 'Baseado na CLT, art. 59, você tem direito ao pagamento de horas extras com adicional mínimo de 50%.' },
      { role: 'user', text: 'Como devo documentar as horas?' },
      { role: 'assistant', text: 'Anote horários, guarde mensagens/e-mails, peça confirmação por escrito e procure o sindicato. Caso necessário, considere ação para diferenças salariais.' }
    ]

    // start fresh for demo: fade intro then messages
    setMessages([{ id: Date.now(), role: 'assistant', text: 'Carregando demo...' }])
    await sleep(700)

    for (const step of seq) {
      if (step.role === 'user') {
        add(step)
        await sleep(550)
      } else {
        // show typing
        const typingId = Date.now() + Math.random()
        setMessages(prev => [...prev, { id: typingId, role: 'assistant', text: '...', typing: true }])
        await sleep(700 + Math.random() * 400)
        // replace typing item
        setMessages(prev => prev.map(m => m.id === typingId ? { ...m, text: step.text, typing: false } : m))
        await sleep(550)
      }
    }
  }

  function add(msg) {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }])
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

  async function handleSend(e) {
    e?.preventDefault()
    if (!allowInput) return
    const txt = value.trim()
    if (!txt) return
    setValue('')
    setSending(true)
    add({ role: 'user', text: txt })
    await sleep(500)
    // assistant typing
    const tId = Date.now() + 1
    setMessages(prev => [...prev, { id: tId, role: 'assistant', text: '...', typing: true }])
    await sleep(900)
    setMessages(prev => prev.map(m => m.id === tId ? { ...m, text: `Simulação: recomenda-se documentar e procurar orientação. (resposta a: "${txt.slice(0,80)}")`, typing: false } : m))
    setSending(false)
  }

  return (
    <div className="chat-preview" role="region" aria-label="Preview do chat">
      <div ref={listRef} className="chat-messages" aria-live="polite">
        {messages.map(m => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div className="avatar" aria-hidden>
              {/* avatar: assistant usa ícone galaxy/IA, usuário usa user circle */}
              {m.role === 'assistant' ? (
                <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center'}} aria-hidden>
                  <GiArtificialIntelligence size={18} color="#fff" />
                </div>
              ) : (
                <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center'}} aria-hidden>
                  <FaRegUserCircle size={18} color="#fff" />
                </div>
              )}
            </div>

            <div className="bubble" role="article" aria-label={`${m.role} message`}>
              <div className="text">{m.text}</div>
              {m.typing ? (
                <div style={{marginTop:8}} className="typing-dots" aria-hidden>
                  <span></span><span></span><span></span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Input visual está oculto pelo CSS (preview), mas mantemos markup para acessibilidade */}
      <form className="chat-input" onSubmit={handleSend} aria-hidden={!allowInput}>
        <input
          placeholder={allowInput ? "Digite sua dúvida jurídica aqui..." : "Faça login para usar o chat completo"}
          value={value}
          onChange={e => setValue(e.target.value)}
          disabled={!allowInput}
        />
        <button
          type="submit"
          className="send"
          aria-label="Enviar"
          disabled={!allowInput || sending}
          title={allowInput ? "Enviar" : "Faça login para enviar"}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}