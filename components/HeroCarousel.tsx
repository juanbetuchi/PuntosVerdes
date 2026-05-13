'use client'
import { useEffect, useState } from 'react'

interface MediaItem { _id: string; type: 'video' | 'image'; url: string; orden: number }

const floatingLeaves = [
  { x: '8%',  y: '18%', size: 28, rotate: 15,  duration: '19s', delay: '0s',   opacity: 0.07 },
  { x: '82%', y: '22%', size: 18, rotate: -20, duration: '23s', delay: '3.2s', opacity: 0.06 },
  { x: '58%', y: '12%', size: 34, rotate: 30,  duration: '16s', delay: '1.4s', opacity: 0.06 },
  { x: '28%', y: '68%', size: 22, rotate: -12, duration: '21s', delay: '4.1s', opacity: 0.07 },
  { x: '72%', y: '62%', size: 26, rotate: 42,  duration: '18s', delay: '2.0s', opacity: 0.05 },
  { x: '14%', y: '52%', size: 16, rotate: -38, duration: '26s', delay: '5.3s', opacity: 0.06 },
  { x: '45%', y: '78%', size: 14, rotate: 22,  duration: '20s', delay: '0.8s', opacity: 0.05 },
  { x: '92%', y: '45%', size: 20, rotate: -16, duration: '24s', delay: '3.7s', opacity: 0.06 },
]

export default function HeroCarousel() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch('/api/media').then(r => r.json()).then(setItems)
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % items.length), 5000)
    return () => clearInterval(t)
  }, [items.length])

  return (
    <div className="relative w-full h-56 md:h-80 lg:h-96 overflow-hidden bg-[#071410]">

      {/* Slides */}
      {items.map((item, i) => (
        <div key={item._id} className={`absolute inset-0 transition-opacity duration-1200 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {item.type === 'video'
            ? <video src={item.url} autoPlay muted loop playsInline className="w-full h-full object-cover scale-105" />
            : <img src={item.url} alt="" className="w-full h-full object-cover scale-105" />
          }
        </div>
      ))}

      {/* Capas de overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-[#0a1f12]/35 to-[#1a3a2a]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a2a]/40 via-transparent to-[#1a3a2a]/20" />

      {/* Hojas flotantes */}
      {floatingLeaves.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="#4caf50"
          className="absolute leaf-float pointer-events-none"
          style={{
            left: l.x, top: l.y,
            width: l.size, height: l.size,
            '--lo': l.opacity, '--ld': l.duration,
            animationDelay: l.delay,
            transform: `rotate(${l.rotate}deg)`,
            opacity: l.opacity,
          } as React.CSSProperties}
          aria-hidden
        >
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
        </svg>
      ))}

      {/* Título */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
        {/* Línea decorativa superior */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#4caf50]/50" />
          <span className="text-[#4caf50]/60 text-[10px] uppercase tracking-[0.25em] font-medium">Ciudad de Laboulaye</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#4caf50]/50" />
        </div>

        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-7 h-7 md:w-9 md:h-9 opacity-80 drop-shadow-lg flex-shrink-0">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
          </svg>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-2xl">
            <span className="text-white">Puntos </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81c784] via-[#4caf50] to-[#a5d6a7]">Verdes</span>
          </h1>
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-7 h-7 md:w-9 md:h-9 opacity-80 drop-shadow-lg flex-shrink-0 scale-x-[-1]">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
          </svg>
        </div>
      </div>

      {/* Wave + indicadores */}
      <div className="absolute bottom-0 left-0 right-0">
        {items.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${i === current ? 'bg-white/60 w-5 h-1.5' : 'bg-white/20 w-1.5 h-1.5'}`}
              />
            ))}
          </div>
        )}
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-10 md:h-12" fill="#1a3a2a">
          <path d="M0,24 C180,48 360,0 540,24 C720,48 900,8 1080,28 C1200,40 1320,10 1440,24 L1440,48 L0,48 Z"/>
        </svg>
      </div>
    </div>
  )
}
