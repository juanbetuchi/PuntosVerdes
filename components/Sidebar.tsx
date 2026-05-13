'use client'
import { useState } from 'react'
import Link from 'next/link'

interface SidebarProps {
  categoria: 'local' | 'provincial' | null
  onCategoriaChange: (cat: 'local' | 'provincial') => void
  onHome: () => void
}

const navItems = [
  {
    key: 'local' as const,
    label: 'Puntos Locales',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
  },
  {
    key: 'provincial' as const,
    label: 'Puntos Provinciales',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
      </svg>
    ),
  },
]

const leafDecos = [
  { size: 'w-5 h-5', delay: '0s',   cls: 'leaf-sway',  rotate: '-10deg' },
  { size: 'w-3 h-3', delay: '0.7s', cls: 'leaf-drift', rotate: '20deg'  },
  { size: 'w-6 h-6', delay: '1.2s', cls: 'leaf-sway',  rotate: '0deg'   },
  { size: 'w-3 h-3', delay: '1.9s', cls: 'leaf-drift', rotate: '-25deg' },
  { size: 'w-4 h-4', delay: '0.4s', cls: 'leaf-sway',  rotate: '15deg'  },
]

export default function Sidebar({ categoria, onCategoriaChange, onHome }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botón mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0d2318]/80 backdrop-blur-md border border-[#4caf50]/25 text-white p-2.5 rounded-xl shadow-lg"
        onClick={() => setOpen(o => !o)}
        aria-label="Menú"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay mobile */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar — glassmorphism */}
      <aside className={`
        fixed left-0 top-0 h-full w-[220px] z-40 flex flex-col
        bg-[#0a1d12]/82 backdrop-blur-xl
        border-r border-white/6
        shadow-[4px_0_30px_rgba(0,0,0,0.5)]
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Brillo sutil arriba */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4caf50]/30 to-transparent" />

        {/* Header */}
        <div className="p-5 pt-7 border-b border-white/6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[#4caf50]/5 blur-xl pointer-events-none" />
          <button
            onClick={() => { onHome(); setOpen(false) }}
            className="flex items-center gap-2.5 relative group w-full text-left"
            title="Volver al mapa principal"
          >
            <div className="w-8 h-8 rounded-lg bg-[#4caf50]/15 border border-[#4caf50]/25 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:bg-[#4caf50]/25 transition-colors">
              <svg viewBox="0 0 24 24" fill="#4caf50" className="w-5 h-5">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
              </svg>
            </div>
            <div>
              <p className="text-white/90 font-bold text-sm leading-tight group-hover:text-white transition-colors">Puntos Verdes</p>
              <p className="text-[#4caf50]/50 text-[10px] leading-tight tracking-wide">Laboulaye</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 mb-1 mt-1">Categorías</p>
          {navItems.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { onCategoriaChange(key); setOpen(false) }}
              className={`
                relative flex items-center gap-3 text-left px-3 py-3 rounded-xl text-sm font-medium
                transition-all duration-250 group overflow-hidden
                ${categoria === key
                  ? 'text-white/88 bg-white/7 border border-white/10'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/4 border border-transparent'}
              `}
            >
              {/* Acento izquierdo — sólo activo */}
              {categoria === key && (
                <span className="absolute left-0 inset-y-2 w-[3px] rounded-full bg-gradient-to-b from-[#81c784]/70 via-[#4caf50]/50 to-transparent" />
              )}
              {/* Brillo interior sutil */}
              {categoria === key && (
                <span className="absolute inset-0 bg-gradient-to-r from-[#4caf50]/5 to-transparent pointer-events-none rounded-xl" />
              )}
              <span className={`transition-colors duration-200 ${categoria === key ? 'text-[#a5d6a7]' : 'text-[#4caf50]/40 group-hover:text-[#4caf50]/65'}`}>
                {icon}
              </span>
              {label}
            </button>
          ))}
        </nav>

        {/* Hojas animadas */}
        <div className="px-3 pb-3 flex gap-1.5 justify-center">
          {leafDecos.map((l, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              fill="#4caf50"
              className={`${l.size} ${l.cls}`}
              style={{ animationDelay: l.delay, transform: `rotate(${l.rotate})`, opacity: 0.18 }}
              aria-hidden
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
            </svg>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5">
          <Link href="/admin" className="block text-center text-[11px] text-white/18 hover:text-white/45 transition-colors py-1.5">
            ⚙ Panel Admin
          </Link>
        </div>
      </aside>
    </>
  )
}
