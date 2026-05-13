'use client'
import { useState, useEffect, useRef } from 'react'

const faqs = [
  { q: '¿Qué son los Puntos Verdes?',      a: 'Son centros de reciclaje urbanos distribuidos en la Ciudad de Laboulaye y la región donde podés depositar materiales reciclables de forma gratuita.' },
  { q: '¿Qué materiales acepta?',           a: 'Papel, cartón, plásticos, vidrio, metales y electrónicos. Cada punto indica qué recibe. Deben estar limpios y secos.' },
  { q: '¿Dónde están ubicados?',            a: 'Usá el mapa interactivo del sitio. Seleccioná "Puntos Locales" para Laboulaye o "Puntos Provinciales" para la región de Córdoba Sur.' },
  { q: '¿Cómo participar?',                 a: '¡Muy fácil! Separá los materiales en casa, limpiálos y lleválos al punto verde más cercano. Gratuito, sin registro.' },
  { q: '¿Con qué frecuencia están abiertos?', a: 'Depende de cada punto. Podés ver horarios y detalles haciendo clic en el pin del mapa interactivo.' },
]

interface Msg { from: 'bot' | 'user'; text: string }
const greeting: Msg = { from: 'bot', text: '¡Hola! 🌿 Soy Brote, el asistente de Puntos Verdes — Ciudad de Laboulaye. ¿En qué puedo ayudarte?' }

/* ── Mascot SVG ── */
function MascotSvg({ happy, waving }: { happy: boolean; waving: boolean }) {
  return (
    <svg viewBox="0 0 64 76" className="w-full h-full" aria-hidden>
      {/* Sombra */}
      <ellipse cx="32" cy="72" rx="13" ry="3.5" fill="rgba(0,0,0,0.18)" />

      {/* Cuerpo */}
      <circle cx="32" cy="38" r="23" fill="#1b4332" />
      <circle cx="32" cy="38" r="19" fill="#2d6a4f" />
      <circle cx="32" cy="38" r="16" fill="#40916c" />

      {/* Brazo izquierdo */}
      <ellipse cx="10" cy="36" rx="5" ry="9" fill="#52b788"
        style={{ transformOrigin: '10px 44px', transform: 'rotate(-12deg)' }} />

      {/* Brazo derecho — se mueve cuando wave */}
      <ellipse cx="54" cy="30" rx="5" ry="9" fill="#52b788"
        className={waving ? 'mascot-wave' : ''}
        style={{ transformOrigin: '54px 44px', transform: waving ? '' : 'rotate(12deg)' }} />

      {/* Hoja izquierda (pelo) */}
      <path d="M24 16 C18 6 8 10 13 19 C16 24 24 20 24 16Z" fill="#74c69d" />
      {/* Hoja derecha (pelo) */}
      <path d="M40 16 C46 6 56 10 51 19 C48 24 40 20 40 16Z" fill="#95d5b2" />
      {/* Centro del pelo */}
      <path d="M32 14 C28 8 36 6 32 14Z" fill="#b7e4c7" />

      {/* Ojo izquierdo */}
      <g className="mascot-eye">
        <circle cx="25" cy="34" r="5" fill="white" />
        <circle cx="26.5" cy="35" r="2.8" fill="#1b4332" />
        <circle cx="27.5" cy="33.5" r="1.1" fill="white" />
      </g>

      {/* Ojo derecho */}
      <g className="mascot-eye" style={{ animationDelay: '0.15s' }}>
        <circle cx="39" cy="34" r="5" fill="white" />
        <circle cx="40.5" cy="35" r="2.8" fill="#1b4332" />
        <circle cx="41.5" cy="33.5" r="1.1" fill="white" />
      </g>

      {/* Mejillas */}
      <circle cx="19" cy="39" r="4.5" fill="#95d5b2" opacity="0.45" />
      <circle cx="45" cy="39" r="4.5" fill="#95d5b2" opacity="0.45" />

      {/* Boca — cambia si happy */}
      {happy ? (
        <path d="M24 43 Q32 52 40 43" stroke="#1b4332" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M26 44 Q32 49 38 44" stroke="#1b4332" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}

export default function PuntosVerdesBot() {
  const [open, setOpen]     = useState(false)
  const [msgs, setMsgs]     = useState<Msg[]>([greeting])
  const [typing, setTyping] = useState(false)
  const [waving, setWaving] = useState(false)
  const [pos, setPos]       = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastTouchTime = useRef(0)

  /* wave inicial */
  useEffect(() => {
    const t = setTimeout(() => { setWaving(true); setTimeout(() => setWaving(false), 900) }, 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing])

  /* ── Drag + click ── */
  function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
    const isTouch = 'touches' in e
    if (!isTouch) {
      if (Date.now() - lastTouchTime.current < 600) return  // ignorar ghost click de mobile
      e.preventDefault()
    } else {
      lastTouchTime.current = Date.now()
    }
    const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX
    const startY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY
    const origPos = { ...pos }
    let moved = false

    function onMove(ev: MouseEvent | TouchEvent) {
      const isT = 'touches' in ev
      const cx = isT ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX
      const cy = isT ? (ev as TouchEvent).touches[0].clientY : (ev as MouseEvent).clientY
      if (Math.abs(cx - startX) > 10 || Math.abs(cy - startY) > 10) moved = true
      if (moved) {
        if (isT) ev.preventDefault()
        setDragging(true)
        setPos({ x: origPos.x + (cx - startX), y: origPos.y + (cy - startY) })
      }
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
      setDragging(false)
      if (!moved) {
        setOpen(o => !o)
        if (!open) { setWaving(true); setTimeout(() => setWaving(false), 900) }
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }

  function askFaq(faq: typeof faqs[0]) {
    setMsgs(m => [...m, { from: 'user', text: faq.q }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs(m => [...m, { from: 'bot', text: faq.a }])
    }, 950)
  }

  const btnStyle: React.CSSProperties = {
    right: `${20 - pos.x}px`,
    bottom: `${24 - pos.y}px`,
    cursor: dragging ? 'grabbing' : 'grab',
  }

  const panelStyle: React.CSSProperties = {
    right: `${20 - pos.x}px`,
    bottom: `${148 - pos.y}px`,
  }

  return (
    <>
      {/* Botón mascot */}
      <div
        className="fixed z-50 select-none"
        style={btnStyle}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Sombra y glow */}
        {!open && (
          <div className="absolute -inset-2 rounded-full bg-[#4caf50]/15 blur-md animate-pulse pointer-events-none" />
        )}

        {/* Label hover */}
        {!open && !dragging && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#0d2318]/90 border border-[#4caf50]/25 rounded-xl px-3 py-1.5 pointer-events-none opacity-0 hover-label whitespace-nowrap">
            <span className="text-[#a5d6a7] text-xs font-medium">Soy Brote 🌿</span>
          </div>
        )}

        <div className={`w-28 h-28 ${!dragging ? 'mascot-float' : ''}`}
          style={{ filter: open ? 'drop-shadow(0 0 8px rgba(76,175,80,0.6))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
        >
          <MascotSvg happy={open} waving={waving} />
        </div>

        {/* Burbuja de texto cuando está cerrado */}
        {!open && !dragging && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0d2318]/90 border border-[#4caf50]/30 rounded-full px-2.5 py-1 text-[10px] text-[#a5d6a7] whitespace-nowrap shadow-lg animate-pulse pointer-events-none">
            ¿Preguntas?
          </div>
        )}
      </div>

      {/* Panel chat */}
      <div
        className={`fixed z-50 w-[min(340px,calc(100vw-24px))] transition-all duration-350 origin-bottom-right ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={panelStyle}
      >
        <div className="bg-[#0d2318]/97 backdrop-blur-xl border border-[#4caf50]/25 rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-[#4caf50]/40 to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/6">
            <div className="w-9 h-9 flex-shrink-0">
              <MascotSvg happy waving={false} />
            </div>
            <div>
              <p className="text-white/90 text-sm font-bold leading-tight">Brote 🌿</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4caf50] animate-pulse" />
                <span className="text-[#4caf50]/60 text-[10px]">Asistente Puntos Verdes</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto w-6 h-6 rounded-full bg-white/8 hover:bg-white/15 text-white/40 hover:text-white/80 flex items-center justify-center text-xs transition-colors"
            >✕</button>
          </div>

          {/* Mensajes */}
          <div className="h-52 overflow-y-auto p-3 space-y-2.5">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-[#4caf50]/20 border border-[#4caf50]/20 text-white/85 rounded-br-sm'
                    : 'bg-white/6 border border-white/8 text-white/70 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/6 border border-white/8 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1 items-center">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-[#4caf50]/60 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Preguntas */}
          <div className="border-t border-white/6 p-2.5 space-y-1.5">
            <p className="text-white/25 text-[10px] uppercase tracking-wider px-1 mb-1.5">Preguntas frecuentes</p>
            {faqs.map((faq, i) => (
              <button
                key={i}
                onClick={() => askFaq(faq)}
                disabled={typing}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/4 hover:bg-[#4caf50]/10 border border-white/6 hover:border-[#4caf50]/25 text-white/55 hover:text-white/85 text-xs transition-all duration-200 disabled:opacity-40"
              >
                {faq.q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
