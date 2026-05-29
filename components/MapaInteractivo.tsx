'use client'
import { useState, useRef } from 'react'

type PinColor = 'green' | 'yellow' | 'red' | 'blue'

const PIN_PALETTE: Record<PinColor, { fill: string; stroke: string; glow: string; ripple: string }> = {
  green:  { fill: 'rgba(26,58,42,0.88)',   stroke: '#4caf50', glow: 'rgba(76,175,80,0.9)',   ripple: '#4caf50' },
  yellow: { fill: 'rgba(60,50,10,0.88)',   stroke: '#facc15', glow: 'rgba(250,204,21,0.9)',  ripple: '#facc15' },
  red:    { fill: 'rgba(60,15,15,0.88)',   stroke: '#f87171', glow: 'rgba(248,113,113,0.9)', ripple: '#f87171' },
  blue:   { fill: 'rgba(15,35,60,0.88)',   stroke: '#60a5fa', glow: 'rgba(96,165,250,0.9)',  ripple: '#60a5fa' },
}

const MATERIALES_OPTS = [
  { key: 'carton',       emoji: '📦', label: 'Cartón'      },
  { key: 'vidrio',       emoji: '🍾', label: 'Vidrio'       },
  { key: 'plastico',     emoji: '🥤', label: 'Plástico'     },
  { key: 'electronico',  emoji: '📱', label: 'Electrónico'  },
  { key: 'pilas',        emoji: '🪫', label: 'Pilas'        },
  { key: 'metal',        emoji: '🔩', label: 'Metal'        },
  { key: 'ropa',         emoji: '👕', label: 'Ropa'         },
  { key: 'organico',     emoji: '🌱', label: 'Orgánico'     },
  { key: 'aceite',       emoji: '🫙', label: 'Aceite'       },
  { key: 'medicamentos', emoji: '💊', label: 'Medicamentos' },
]

interface Pin {
  _id: string; x: number; y: number
  titulo: string; descripcion: string
  imagenes: string[]; videoUrl: string
  direccion?: string; color?: PinColor
  materiales?: string[]; lat?: number | null; lng?: number | null
}
interface Mapa { _id: string; nombre: string; descripcion: string; imageUrl: string }

function getEmbedUrl(url: string) {
  if (url.includes('youtube.com/watch?v=')) {
    try { return `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}` } catch { return url }
  }
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`
  return url
}
function isYoutube(url: string) { return url.includes('youtube.com') || url.includes('youtu.be') }

/* distancia entre dos pins en espacio % */
function dist(a: Pin, b: Pin) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }

interface Burst { id: number; x: number; y: number; emoji: string; dx: number; er: number }
const BURST_EMOJIS = ['🌿', '♻️', '🌱', '✨', '🍃', '💚']

export default function MapaInteractivo({ mapa, pins }: { mapa: Mapa; pins: Pin[] }) {
  const [activePin, setActivePin]   = useState<Pin | null>(null)
  const [hoveredId, setHoveredId]   = useState<string | null>(null)
  const [bursts, setBursts]         = useState<Burst[]>([])
  const [nearestId, setNearestId]   = useState<string | null>(null)
  const [locating, setLocating]     = useState(false)
  const [geoToast, setGeoToast]     = useState('')
  const containerRef                = useRef<HTMLDivElement>(null)

  const pinsConCoordenadas = pins.filter(p => p.lat != null && p.lng != null)

  function findNearest() {
    if (!navigator.geolocation) { setGeoToast('Tu navegador no soporta geolocalización'); return }
    if (pinsConCoordenadas.length === 0) { setGeoToast('Agregá coordenadas GPS a los pins desde el admin'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: uLat, longitude: uLng } = pos.coords
        let best: { pin: Pin; dist: number } | null = null
        for (const pin of pinsConCoordenadas) {
          const d = Math.sqrt((pin.lat! - uLat) ** 2 + (pin.lng! - uLng) ** 2)
          if (!best || d < best.dist) best = { pin, dist: d }
        }
        setLocating(false)
        if (best) { setNearestId(best.pin._id); setActivePin(best.pin); setGeoToast('📍 Punto más cercano encontrado') }
        setTimeout(() => setGeoToast(''), 3000)
      },
      () => { setLocating(false); setGeoToast('No se pudo obtener tu ubicación') }
    )
  }

  function triggerBurst(pin: Pin) {
    const newBursts: Burst[] = BURST_EMOJIS.slice(0, 5).map((emoji, i) => ({
      id: Date.now() + i,
      x: pin.x, y: pin.y,
      emoji,
      dx: (Math.random() - 0.5) * 60,
      er: (Math.random() - 0.5) * 40,
    }))
    setBursts(b => [...b, ...newBursts])
    setTimeout(() => {
      const ids = new Set(newBursts.map(b => b.id))
      setBursts(b => b.filter(x => !ids.has(x.id)))
    }, 1200)
  }

  const hovPin = hoveredId ? pins.find(p => p._id === hoveredId) : null

  return (
    <div className="mb-14 fade-in-up relative">
      {/* Glow detrás del mapa */}
      <div className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 50%, rgba(76,175,80,0.11) 0%, rgba(76,175,80,0.04) 50%, transparent 75%)' }}
      />
      {/* Hojitas decorativas */}
      <svg viewBox="0 0 24 24" fill="#4caf50" aria-hidden
        className="absolute -top-3 -right-3 w-10 h-10 opacity-20 pointer-events-none leaf-sway"
        style={{ animationDuration:'3.5s', transform:'rotate(25deg)' }}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
      </svg>
      <svg viewBox="0 0 24 24" fill="#4caf50" aria-hidden
        className="absolute -bottom-2 -left-3 w-8 h-8 opacity-15 pointer-events-none leaf-drift"
        style={{ animationDuration:'5s', animationDelay:'0.8s', transform:'rotate(-20deg)' }}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
      </svg>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-[#4caf50]/70 via-[#4caf50]/30 to-transparent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-white/90 leading-tight">{mapa.nombre}</h3>
          {mapa.descripcion && <p className="text-white/40 text-sm mt-0.5">{mapa.descripcion}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {/* Botón punto más cercano */}
          <button
            onClick={findNearest}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4caf50]/10 border border-[#4caf50]/25 rounded-full text-[#4caf50] text-xs hover:bg-[#4caf50]/20 transition-all disabled:opacity-50"
          >
            {locating ? (
              <span className="w-3 h-3 border border-[#4caf50] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="w-3 h-3">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
            )}
            {locating ? 'Buscando...' : 'Más cercano'}
          </button>
          {/* Contador */}
          <div className="flex items-center gap-1.5 bg-[#4caf50]/8 border border-[#4caf50]/18 rounded-full px-3 py-1">
            <svg viewBox="0 0 24 24" fill="#4caf50" className="w-3 h-3 opacity-70">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
            </svg>
            <span className="text-[#a5d6a7]/70 text-xs">{pins.length} {pins.length === 1 ? 'punto' : 'puntos'}</span>
          </div>
        </div>
      </div>

      {/* Toast geolocalización */}
      {geoToast && (
        <div className="mb-3 px-3 py-2 bg-[#0d2318]/90 border border-[#4caf50]/30 rounded-xl text-[#a5d6a7] text-xs text-center">
          {geoToast}
        </div>
      )}

      {/* Card imagen */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] card-glow bg-[#071410]"
      >
        {/* Esquinas decorativas */}
        {['top-0 left-0 border-t border-l rounded-tl-2xl','top-0 right-0 border-t border-r rounded-tr-2xl','bottom-0 left-0 border-b border-l rounded-bl-2xl','bottom-0 right-0 border-b border-r rounded-br-2xl'].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 ${cls} border-[#4caf50]/25 z-10 pointer-events-none`} />
        ))}

        <img src={mapa.imageUrl} alt={mapa.nombre} className="w-full block" />

        {/* ── SVG overlay: líneas conectoras ── */}
        {hovPin && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow:'visible' }}>
            <defs>
              <linearGradient id={`lg-${hovPin._id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4caf50" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#81c784" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {pins.filter(p => p._id !== hovPin._id).map(p => {
              const d = dist(hovPin, p)
              if (d > 45) return null
              const opacity = (1 - d / 45) * 0.6
              return (
                <line key={p._id}
                  x1={`${hovPin.x}%`} y1={`${hovPin.y}%`}
                  x2={`${p.x}%`}     y2={`${p.y}%`}
                  stroke="#4caf50"
                  strokeWidth="1.2"
                  strokeDasharray="5 4"
                  opacity={opacity}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(76,175,80,0.8))' }}
                />
              )
            })}
          </svg>
        )}

        {/* ── Emojis burst ── */}
        {bursts.map(b => (
          <div
            key={b.id}
            className="absolute pointer-events-none emoji-float z-30 text-lg select-none"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              '--er': `${b.er}deg`,
              transform: `translate(calc(-50% + ${b.dx}px), -50%)`,
            } as React.CSSProperties}
          >
            {b.emoji}
          </div>
        ))}

        {/* ── Pins ── */}
        {pins.map((pin, idx) => {
          const isActive  = activePin?._id === pin._id
          const isHovered = hoveredId === pin._id
          const isNearest = nearestId === pin._id && !isActive
          const pal = PIN_PALETTE[pin.color ?? 'green']
          return (
            <button
              key={pin._id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-20 pin-appear"
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                animationDelay: `${idx * 0.08}s`,
              }}
              onClick={() => {
                triggerBurst(pin)
                setActivePin(isActive ? null : pin)
              }}
              onMouseEnter={() => setHoveredId(pin._id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={pin.titulo}
            >
              {/* Ondas múltiples */}
              {!isActive && (
                <>
                  <span className="ripple1 absolute left-1/2 top-1/2 w-5 h-5 rounded-full pointer-events-none" style={{ background: `${pal.ripple}55` }} />
                  <span className="ripple2 absolute left-1/2 top-1/2 w-5 h-5 rounded-full pointer-events-none" style={{ background: `${pal.ripple}40` }} />
                  <span className="ripple3 absolute left-1/2 top-1/2 w-5 h-5 rounded-full pointer-events-none" style={{ background: `${pal.ripple}25` }} />
                </>
              )}

              {/* Anillo "más cercano" */}
              {isNearest && (
                <span className="absolute inset-0 rounded-full border-2 border-yellow-300 scale-150 animate-ping pointer-events-none" />
              )}

              {/* Pin SVG */}
              <svg
                width="26" height="26" viewBox="0 0 30 30"
                className={`drop-shadow-xl transition-all duration-200 ${
                  isActive   ? 'scale-130'
                  : isHovered ? 'scale-125'
                  : isNearest ? 'scale-115'
                  : 'group-hover:scale-115'
                }`}
                style={isActive ? { filter: `drop-shadow(0 0 12px ${pal.glow})` } : isHovered || isNearest ? { filter: `drop-shadow(0 0 14px ${pal.glow})` } : {}}
              >
                <circle cx="15" cy="15" r="13" fill={isActive ? pal.glow : isHovered ? pal.stroke + '80' : pal.fill} />
                <circle cx="15" cy="15" r="13" fill="none" stroke={isActive || isHovered || isNearest ? 'white' : pal.stroke} strokeWidth={isHovered || isNearest ? '2' : '1.2'} />
                <g transform="translate(9,8) scale(0.5)">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"
                    fill={isActive || isHovered ? 'white' : pal.stroke} />
                </g>
              </svg>

              {/* Tooltip hover */}
              {!isActive && (
                <div className="hidden group-hover:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex-col items-center pointer-events-none z-30">
                  <div className="bg-[#071410]/95 backdrop-blur-sm border border-[#4caf50]/30 rounded-xl px-3 py-2 shadow-2xl w-44 text-left"
                    style={{ boxShadow: '0 0 20px rgba(76,175,80,0.2)' }}>
                    <p className="text-white/90 text-xs font-semibold leading-tight">{pin.titulo}</p>
                    {pin.descripcion && <p className="text-white/45 text-xs mt-0.5 line-clamp-2">{pin.descripcion}</p>}
                    <p className="text-[#4caf50]/50 text-[10px] mt-1">Click para ver más 🌿</p>
                  </div>
                  <div className="w-2.5 h-2.5 bg-[#071410]/95 border-b border-r border-[#4caf50]/30 rotate-45 -mt-1.5" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Modal */}
      {activePin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setActivePin(null)}>
          <div
            className="bg-[#0d2318]/95 backdrop-blur-xl border border-[#4caf50]/20 rounded-2xl max-w-md w-full shadow-[0_0_60px_rgba(76,175,80,0.08)] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-[#4caf50]/40 to-transparent" />
            <div className="flex justify-between items-start p-5 pb-3 border-b border-white/6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4caf50]/12 border border-[#4caf50]/20 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="#4caf50" className="w-5 h-5">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
                  </svg>
                </div>
                <h4 className="text-base font-bold text-white/90">{activePin.titulo}</h4>
              </div>
              <button onClick={() => setActivePin(null)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/35 hover:text-white/80 transition-colors text-sm ml-3 flex-shrink-0">✕</button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              {activePin.descripcion && <p className="text-white/60 text-sm leading-relaxed">{activePin.descripcion}</p>}

              {/* Materiales aceptados */}
              {activePin.materiales && activePin.materiales.length > 0 && (
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Acepta</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activePin.materiales.map(mat => {
                      const opt = MATERIALES_OPTS.find(o => o.key === mat)
                      return (
                        <span key={mat} className="flex items-center gap-1.5 bg-[#4caf50]/10 border border-[#4caf50]/20 text-white/80 text-xs px-2.5 py-1 rounded-full">
                          {opt ? <><span>{opt.emoji}</span><span>{opt.label}</span></> : <span>{mat}</span>}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              {activePin.imagenes?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {activePin.imagenes.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-24 h-20 object-cover rounded-xl border border-white/8 shadow-md" />
                  ))}
                </div>
              )}
              {activePin.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-white/8">
                  {isYoutube(activePin.videoUrl)
                    ? <iframe src={getEmbedUrl(activePin.videoUrl)} className="w-full aspect-video" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    : <video src={activePin.videoUrl} controls className="w-full" />
                  }
                </div>
              )}
              {activePin.direccion && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="#4caf50" className="w-3.5 h-3.5 opacity-60"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span className="text-white/35 text-xs">{activePin.direccion}</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[#4caf50]/15 h-44">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(activePin.direccion)}&output=embed&hl=es&z=15`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(activePin.direccion)}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#4caf50]/60 hover:text-[#4caf50] text-xs transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                    Abrir en Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
