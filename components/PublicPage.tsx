'use client'
import { useEffect, useRef, useState } from 'react'
import TopNav from './TopNav'
import HeroCarousel from './HeroCarousel'
import MapaInteractivo from './MapaInteractivo'
import FallingLeaves from './FallingLeaves'
import PuntosVerdesBot from './PuntosVerdesBot'

const BG_URL = 'https://gkqpcbqdzdmhiokosvxa.supabase.co/storage/v1/object/public/datos/atardecerlbye.png'

interface Mapa {
  _id: string
  nombre: string
  descripcion: string
  imageUrl: string
  categoria: 'local' | 'provincial'
  activo: boolean
}
interface Pin {
  _id: string; mapaId: string
  x: number; y: number
  titulo: string; descripcion: string
  imagenes: string[]; videoUrl: string
  materiales?: string[]
  direccion?: string
  color?: 'green' | 'yellow' | 'red' | 'blue'
  lat?: number | null
  lng?: number | null
}
interface PublicPageProps {
  mapas: Mapa[]
  pinsMap: Record<string, Pin[]>
}

function AnimatedCounter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return <>{count}</>
}

/* ─── Partículas flotantes del hero ─── */
const floatingLeaves = [
  { x:'6%',  y:'10%', s:30, r:15,  ld:'19s', d:'0s',   lo:0.07 },
  { x:'88%', y:'15%', s:20, r:-22, ld:'24s', d:'2.5s', lo:0.06 },
  { x:'52%', y:'6%',  s:24, r:35,  ld:'18s', d:'1.2s', lo:0.05 },
  { x:'12%', y:'70%', s:18, r:-15, ld:'22s', d:'4.1s', lo:0.06 },
  { x:'78%', y:'65%', s:26, r:28,  ld:'26s', d:'1.8s', lo:0.05 },
  { x:'35%', y:'85%', s:16, r:-30, ld:'20s', d:'3.3s', lo:0.05 },
  { x:'65%', y:'78%', s:14, r:18,  ld:'23s', d:'0.7s', lo:0.04 },
]

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

const PASOS = [
  {
    num: '01', title: 'Explorá el mapa',
    desc: 'Encontrá los puntos verdes más cercanos usando el mapa interactivo con filtros por material.',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>,
  },
  {
    num: '02', title: 'Separar en casa',
    desc: 'Clasificá tus residuos reciclables: papel, vidrio, plástico, electrónicos y más.',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>,
  },
  {
    num: '03', title: 'Llevá y reciclá',
    desc: 'Acercate al punto elegido y entregá los materiales. Juntos construimos una ciudad más limpia.',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  },
]

const MATERIALES_LANDING = [
  { emoji:'📦', label:'Cartón',       desc:'Cajas, revistas' },
  { emoji:'🍾', label:'Vidrio',        desc:'Botellas, frascos' },
  { emoji:'🥤', label:'Plástico',      desc:'Envases, botellas' },
  { emoji:'📱', label:'Electrónico',   desc:'Celulares, PC' },
  { emoji:'🪫', label:'Pilas',         desc:'Todo tipo' },
  { emoji:'🔩', label:'Metal',         desc:'Latas, aluminio' },
  { emoji:'👕', label:'Ropa',          desc:'Indumentaria' },
  { emoji:'🌱', label:'Orgánico',      desc:'Restos cocina' },
  { emoji:'🫙', label:'Aceite',        desc:'Vegetal usado' },
  { emoji:'💊', label:'Medicamentos',  desc:'Vencidos' },
]

const homeCards = [
  {
    key: 'local' as const,
    label: 'Puntos Locales',
    sub: 'Ciudad de Laboulaye — red urbana',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    key: 'provincial' as const,
    label: 'Puntos Provinciales',
    sub: 'Córdoba Sur — red regional',
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9">
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
      </svg>
    ),
  },
]

/* ─── Pantalla principal (home) ─── */
function HomeScreen({ onSelect, stats }: {
  onSelect: (c: 'local' | 'provincial') => void
  stats: { totalPins: number; totalMapas: number; totalMateriales: number }
}) {
  useScrollReveal()
  return (
    <div>

    {/* ─── HERO ─── */}
    <section className="relative w-full h-screen overflow-hidden">

      {/* Fondo Ken Burns — va detrás de la nav */}
      <div className="absolute inset-0">
        <img src={BG_URL} alt="" className="w-full h-full object-cover ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#071410]/55 via-[#0a1f12]/45 to-[#071410]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071410]/30 via-transparent to-[#071410]/15" />
      </div>

      {/* Hojas flotantes */}
      {floatingLeaves.map((l, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="#4caf50"
          className="absolute leaf-float pointer-events-none"
          style={{ left:l.x, top:l.y, width:l.s, height:l.s, opacity:l.lo,
            '--lo':l.lo, '--ld':l.ld, animationDelay:l.d,
            transform:`rotate(${l.r}deg)` } as React.CSSProperties}
          aria-hidden
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
        </svg>
      ))}

      {/* Contenido centrado — con padding-top para no quedar bajo la nav */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center pt-14">

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/40" />
          <span className="text-white/80 text-[11px] uppercase tracking-[0.28em]">Ciudad de Laboulaye</span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/40" />
        </div>

        {/* Título */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-8 h-8 md:w-11 md:h-11 opacity-80 drop-shadow-xl">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
          </svg>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-2xl">
            <span className="text-white">Puntos </span>
            <span className="verdes-shimmer">Verdes</span>
          </h1>
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-8 h-8 md:w-11 md:h-11 opacity-80 drop-shadow-xl scale-x-[-1]">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
          </svg>
        </div>

        {/* Stats animados — glass pill */}
        <div className="flex items-stretch bg-white/6 backdrop-blur-md border border-white/12 rounded-2xl overflow-hidden mb-8 divide-x divide-white/10 fade-in-up" style={{ animationDelay: '0.15s' }}>
          {([
            {
              value: stats.totalPins, label: 'Puntos activos',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
            },
            {
              value: stats.totalMapas, label: 'Mapas activos',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>,
            },
            {
              value: stats.totalMateriales, label: 'Materiales',
              icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>,
            },
          ] as { value: number; label: string; icon: React.ReactNode }[]).map((s, i) => (
            <div key={i} className="flex flex-col items-center px-5 sm:px-8 py-3 sm:py-4">
              <div className="text-[#4caf50]/70 mb-1.5">{s.icon}</div>
              <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums leading-none">
                <AnimatedCounter target={s.value} duration={1200 + i * 200} />
              </div>
              <div className="text-white/45 text-[10px] uppercase tracking-wider mt-1 whitespace-nowrap">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-white/75 text-sm mb-8 tracking-wide">
          Seleccioná una categoría para explorar el mapa
        </p>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
          {homeCards.map((card, i) => (
            <button
              key={card.key}
              onClick={() => onSelect(card.key)}
              className="home-card-leaves relative glass-card card-leaf-mobile sm:rounded-2xl p-4 sm:p-7 text-left sm:text-left flex flex-col items-center sm:items-start gap-3 sm:gap-4 group fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Planta que crece desde la base al hover */}
              {[
                { rot: '0deg',   left: 'calc(50% - 30px)', w: 60,  fill: '#4a6b20', vein: '#2a3d10', delay: '0s'    },
                { rot: '22deg',  left: 'calc(58% - 30px)', w: 58,  fill: '#5a7a28', vein: '#2a3d10', delay: '0.07s' },
                { rot: '-22deg', left: 'calc(42% - 30px)', w: 58,  fill: '#5a7a28', vein: '#2a3d10', delay: '0.07s' },
                { rot: '46deg',  left: 'calc(67% - 32px)', w: 64,  fill: '#3a5518', vein: '#1e2e0a', delay: '0.16s' },
                { rot: '-46deg', left: 'calc(33% - 32px)', w: 64,  fill: '#3a5518', vein: '#1e2e0a', delay: '0.16s' },
              ].map(({ rot, left, w, fill, vein, delay }, idx) => (
                <span key={idx} className="hcl-stem" style={{ left, transform: `rotate(${rot})` }}>
                  <svg className="hcl-leaf" style={{ width: w, height: 'auto', transitionDelay: delay }} viewBox="0 0 32 52" xmlns="http://www.w3.org/2000/svg">
                    {/* Hoja ovalada con punta, base abajo */}
                    <path d="M16 50 C7 42 1 32 1 19 C1 8 8 1 16 1 C24 1 31 8 31 19 C31 32 25 42 16 50Z" fill={fill}/>
                    {/* Vena central */}
                    <path d="M16 49 L16 2" stroke={vein} strokeWidth="0.9" fill="none"/>
                    {/* Venas laterales izquierda */}
                    <path d="M16 15 Q10 12 5 14" stroke={vein} strokeWidth="0.45" fill="none" opacity="0.75"/>
                    <path d="M16 23 Q9 20 4 22"  stroke={vein} strokeWidth="0.45" fill="none" opacity="0.75"/>
                    <path d="M16 31 Q10 28 6 30"  stroke={vein} strokeWidth="0.45" fill="none" opacity="0.75"/>
                    {/* Venas laterales derecha */}
                    <path d="M16 15 Q22 12 27 14" stroke={vein} strokeWidth="0.45" fill="none" opacity="0.75"/>
                    <path d="M16 23 Q23 20 28 22" stroke={vein} strokeWidth="0.45" fill="none" opacity="0.75"/>
                    <path d="M16 31 Q22 28 26 30" stroke={vein} strokeWidth="0.45" fill="none" opacity="0.75"/>
                  </svg>
                </span>
              ))}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white/10 border border-white/14 group-hover:bg-white/17 transition-colors shadow-inner">
                <div className="w-6 h-6 sm:w-9 sm:h-9 [&>svg]:w-full [&>svg]:h-full">{card.icon}</div>
              </div>
              <div>
                <p className="text-white font-bold text-sm sm:text-lg leading-tight">{card.label}</p>
                <p className="text-white/38 text-[10px] sm:text-xs mt-1">{card.sub}</p>
              </div>
              <div className="mt-auto pt-2 sm:pt-3 border-t border-white/8 w-full flex items-center justify-center sm:justify-between">
                <span className="text-white/30 text-[10px] sm:text-xs uppercase tracking-wider">Ver mapa</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                  className="hidden sm:block w-4 h-4 opacity-30 group-hover:opacity-65 group-hover:translate-x-1.5 transition-all duration-200">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Wave + scroll indicator */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="w-full h-8" fill="#071410">
          <path d="M0,20 C240,40 480,0 720,20 C960,40 1200,8 1440,24 L1440,40 L0,40 Z"/>
        </svg>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none bounce-down">
        <span className="text-white/35 text-[10px] uppercase tracking-widest">Scroll</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>

    </section>

    {/* ─── CÓMO FUNCIONA ─── */}
    <section className="py-24 px-6" style={{ background: '#071410' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 reveal">
          <span className="text-[#4caf50]/60 text-xs uppercase tracking-[0.22em]">Paso a paso</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3">¿Cómo funciona?</h2>
          <p className="text-white/40 text-sm mt-2 max-w-md mx-auto">Tres pasos simples para ser parte de la red de reciclaje de Laboulaye</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {PASOS.map((paso, i) => (
            <div key={i} className={`reveal reveal-d${i+1} group`}>
              <div className="relative bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-[#4caf50]/30 hover:bg-white/5 transition-all duration-300">
                <div className="absolute -top-4 left-6 bg-[#4caf50] text-white text-xs font-black px-3 py-1 rounded-full tracking-wider shadow-lg shadow-[#4caf50]/20">
                  {paso.num}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#4caf50]/10 border border-[#4caf50]/20 flex items-center justify-center text-[#4caf50] mb-4 mt-2 group-hover:bg-[#4caf50]/20 transition-colors">
                  {paso.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{paso.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ─── MATERIALES ─── */}
    <section className="py-24 px-6" style={{ background: '#060f08' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14 reveal">
          <span className="text-[#4caf50]/60 text-xs uppercase tracking-[0.22em]">Qué podés reciclar</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3">Materiales aceptados</h2>
          <p className="text-white/40 text-sm mt-2 max-w-md mx-auto">Cada punto verde indica qué materiales recibe. Filtralo desde el mapa.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {MATERIALES_LANDING.map((m, i) => (
            <div key={i} className={`reveal reveal-d${Math.min(i % 5 + 1, 5)} flex flex-col items-center gap-2 bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-[#4caf50]/30 hover:bg-white/5 transition-all duration-300 text-center`}>
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-white font-semibold text-sm">{m.label}</span>
              <span className="text-white/35 text-[10px] leading-tight">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ─── CTA ─── */}
    <section className="py-20 px-6 text-center" style={{ background: '#071410' }}>
      <div className="max-w-xl mx-auto reveal">
        <svg viewBox="0 0 24 24" fill="#4caf50" className="w-10 h-10 mx-auto mb-4 opacity-70">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
        </svg>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">¿Listo para reciclar?</h2>
        <p className="text-white/45 text-sm mb-10">Explorá los puntos verdes de Laboulaye y la región sur de Córdoba.</p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {homeCards.map((card) => (
            <button key={card.key} onClick={() => onSelect(card.key)}
              className="flex flex-col items-center gap-2.5 py-5 px-4 rounded-2xl border border-[#4caf50]/25 bg-[#4caf50]/8 hover:bg-[#4caf50]/15 hover:border-[#4caf50]/45 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-[#4caf50]/15 border border-[#4caf50]/25 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 group-hover:bg-[#4caf50]/25 transition-colors">
                {card.icon}
              </div>
              <span className="text-white font-semibold text-xs">{card.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>

    {/* ─── FOOTER ─── */}
    <footer style={{ background: '#040c06' }} className="border-t border-white/5 py-10 px-8">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-7 h-7 opacity-80">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
          </svg>
          <div>
            <p className="text-white font-bold text-sm">Puntos Verdes</p>
            <p className="text-white/35 text-[11px]">Ciudad de Laboulaye · Córdoba</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-white/25 text-xs">
          <button onClick={() => onSelect('local')} className="hover:text-white/60 transition-colors">Puntos Locales</button>
          <button onClick={() => onSelect('provincial')} className="hover:text-white/60 transition-colors">Puntos Provinciales</button>
        </div>
        <p className="text-white/18 text-[11px] text-center sm:text-right">
          Municipalidad de Laboulaye
        </p>
      </div>
    </footer>

    </div>
  )
}

/* ─── Header categoría ─── */
function SectionHeader({ categoria, onBack }: { categoria: 'local' | 'provincial'; onBack: () => void }) {
  const isLocal = categoria === 'local'
  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs transition-colors group">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Inicio
      </button>
      <div className="h-4 w-px bg-white/10" />
      <div className="flex items-center gap-2.5 flex-1">
        <div className="w-8 h-8 rounded-lg bg-[#4caf50]/12 border border-[#4caf50]/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-5 h-5">
            {isLocal
              ? <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              : <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
            }
          </svg>
        </div>
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-widest">{isLocal ? 'Ámbito local' : 'Ámbito provincial'}</p>
          <h2 className="text-lg md:text-xl font-extrabold text-white/90 leading-tight">
            {isLocal ? 'Puntos Locales' : 'Puntos Provinciales'}
          </h2>
        </div>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-[#4caf50]/25 to-transparent max-w-32" />
    </div>
  )
}

/* ─── Página principal ─── */
export default function PublicPage({ mapas, pinsMap }: PublicPageProps) {
  const [categoria, setCategoria] = useState<'local' | 'provincial' | null>(null)
  const filtered = categoria ? mapas.filter(m => m.categoria === categoria) : []

  const allPins = Object.values(pinsMap).flat()
  const stats = {
    totalPins:       allPins.length,
    totalMapas:      mapas.length,
    totalMateriales: new Set(allPins.flatMap(p => p.materiales ?? [])).size,
  }

  return (
    <div className="min-h-screen">

      {/* Nav superior — siempre visible */}
      <TopNav
        categoria={categoria}
        onCategoriaChange={setCategoria}
        onHome={() => setCategoria(null)}
      />

      {/* Contenido principal */}
      <main>

        {/* HOME — pantalla completa, la nav se superpone encima */}
        {categoria === null && <HomeScreen onSelect={setCategoria} stats={stats} />}

        {/* CATEGORÍA — empieza debajo de la nav */}
        {categoria !== null && (
          <div key={categoria} className="section-enter pt-14">
            <HeroCarousel />

            {/* Fondo decorativo */}
            <div className="relative">
              <FallingLeaves />

              {/* Patrón de puntos */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(76,175,80,0.055) 1px, transparent 0)`,
                  backgroundSize: '32px 32px',
                }}
              />
              {/* Glow central */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 35%, rgba(76,175,80,0.07) 0%, transparent 70%)' }}
              />

              {/* Hojas decorativas animadas */}
              <svg viewBox="0 0 24 24" fill="#4caf50" aria-hidden
                className="absolute top-6 right-6 w-40 h-40 opacity-[0.10] pointer-events-none leaf-sway"
                style={{ animationDuration:'5s', transform:'rotate(20deg)' }}>
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="#4caf50" aria-hidden
                className="absolute top-32 left-4 w-24 h-24 opacity-[0.09] pointer-events-none leaf-drift"
                style={{ animationDuration:'6s', animationDelay:'1s', transform:'rotate(-30deg)' }}>
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="#4caf50" aria-hidden
                className="absolute bottom-16 left-8 w-36 h-36 opacity-[0.08] pointer-events-none leaf-drift"
                style={{ animationDuration:'7s', animationDelay:'2s', transform:'rotate(-15deg)' }}>
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
              </svg>
              <svg viewBox="0 0 24 24" fill="#4caf50" aria-hidden
                className="absolute bottom-8 right-10 w-20 h-20 opacity-[0.09] pointer-events-none leaf-sway"
                style={{ animationDuration:'4.5s', animationDelay:'1.5s', transform:'rotate(40deg)' }}>
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
              </svg>

              {/* Contenido centrado */}
              <div className="relative z-10 px-5 md:px-8 py-8 max-w-3xl mx-auto">
                <SectionHeader categoria={categoria} onBack={() => setCategoria(null)} />
                {filtered.length === 0 ? (
                  <div className="py-16 text-center text-white/35 text-sm">No hay mapas activos en esta categoría.</div>
                ) : (
                  filtered.map(mapa => (
                    <MapaInteractivo key={mapa._id} mapa={mapa} pins={pinsMap[mapa._id] ?? []} />
                  ))
                )}
              </div>
            </div>

            <footer className="border-t border-white/5 py-5 px-8 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="#4caf50" className="w-3.5 h-3.5 opacity-25">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
              </svg>
              <span className="text-white/18 text-xs">Puntos Verdes — Ciudad de Laboulaye</span>
            </footer>
          </div>
        )}
      </main>

      <PuntosVerdesBot />
    </div>
  )
}
