'use client'
import { useState } from 'react'
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
  _id: string
  mapaId: string
  x: number; y: number
  titulo: string; descripcion: string
  imagenes: string[]; videoUrl: string
}
interface PublicPageProps {
  mapas: Mapa[]
  pinsMap: Record<string, Pin[]>
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
function HomeScreen({ onSelect }: { onSelect: (c: 'local' | 'provincial') => void }) {
  return (
    <div className="relative w-full h-screen overflow-hidden">

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
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-white/40 text-[11px] uppercase tracking-[0.28em]">Ciudad de Laboulaye</span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/20" />
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

        <p className="text-white/40 text-sm mb-10 tracking-wide">
          Seleccioná una categoría para explorar el mapa
        </p>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-lg">
          {homeCards.map((card, i) => (
            <button
              key={card.key}
              onClick={() => onSelect(card.key)}
              className="glass-card card-leaf-mobile sm:rounded-2xl p-4 sm:p-7 text-left sm:text-left flex flex-col items-center sm:items-start gap-3 sm:gap-4 group fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
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

      {/* Wave inferior */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 32" preserveAspectRatio="none" className="w-full h-6" fill="#1a3a2a">
          <path d="M0,16 C240,32 480,0 720,16 C960,32 1200,8 1440,20 L1440,32 L0,32 Z"/>
        </svg>
      </div>
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
        {categoria === null && <HomeScreen onSelect={setCategoria} />}

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
