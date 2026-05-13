'use client'
import { useState } from 'react'
import Link from 'next/link'

interface TopNavProps {
  categoria: 'local' | 'provincial' | null
  onCategoriaChange: (cat: 'local' | 'provincial') => void
  onHome: () => void
}

const navItems = [
  {
    key: 'local' as const,
    label: 'Puntos Locales',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    key: 'provincial' as const,
    label: 'Puntos Provinciales',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
      </svg>
    ),
  },
]

export default function TopNav({ categoria, onCategoriaChange, onHome }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40">
        {/* Barra principal — muy transparente como Ciudades Verdes */}
        <div className="bg-[#071410]/45 backdrop-blur-lg border-b border-white/8">

          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">

            {/* Logo — estilo CIUDADES VERDES */}
            <button
              onClick={() => { onHome(); setMobileOpen(false) }}
              className="flex items-center gap-3 group flex-shrink-0"
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="#4caf50" className="w-8 h-8 drop-shadow-lg">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
                </svg>
              </div>
              <div className="text-left leading-none">
                <p className="font-black text-base tracking-tight">
                  <span className="text-white uppercase">Puntos</span>
                  <span className="text-[#4caf50] uppercase"> Verdes</span>
                </p>
                <p className="text-white/30 text-[9px] tracking-[0.18em] uppercase mt-0.5">Ciudad de Laboulaye</p>
              </div>
            </button>

            {/* Nav items — desktop */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navItems.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => onCategoriaChange(key)}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 group rounded-lg
                    ${categoria === key
                      ? 'text-white bg-white/8 border border-white/10'
                      : 'text-white/50 hover:text-white/85 hover:bg-white/5 border border-transparent'}
                  `}
                >
                  {/* Línea inferior activo */}
                  {categoria === key && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#4caf50]/70" />
                  )}
                  <span className={`transition-colors ${categoria === key ? 'text-[#81c784]' : 'text-[#4caf50]/45 group-hover:text-[#4caf50]/70'}`}>
                    {icon}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/60 transition-colors uppercase tracking-widest"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Admin
              </Link>

              {/* Hamburger mobile */}
              <button
                className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Menú"
              >
                {mobileOpen ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="3" y1="6"  x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú mobile */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-52' : 'max-h-0'}`}>
          <div className="bg-[#071410]/92 backdrop-blur-xl border-b border-white/8 px-4 py-3 space-y-1">
            {navItems.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => { onCategoriaChange(key); setMobileOpen(false) }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left
                  ${categoria === key
                    ? 'text-white bg-white/8 border border-white/10'
                    : 'text-white/45 hover:text-white/75 hover:bg-white/5 border border-transparent'}
                `}
              >
                <span className={categoria === key ? 'text-[#81c784]' : 'text-[#4caf50]/45'}>{icon}</span>
                {label}
              </button>
            ))}
            <Link
              href="/admin"
              className="block px-3 py-2 text-[10px] text-white/25 hover:text-white/50 transition-colors uppercase tracking-widest"
              onClick={() => setMobileOpen(false)}
            >
              ⚙ Admin
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
