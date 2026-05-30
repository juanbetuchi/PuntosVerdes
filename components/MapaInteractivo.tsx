'use client'
import { useEffect, useRef, useState } from 'react'

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
  imagenes: string[]; videoUrl: string; audioUrl?: string
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

function getDensity(pin: Pin, all: Pin[]): number {
  return all.filter(p => p._id !== pin._id && dist(p, pin) < 25).length
}

interface Burst { id: number; x: number; y: number; emoji: string; dx: number; er: number }
const BURST_EMOJIS = ['🌿', '♻️', '🌱', '✨', '🍃', '💚']

export default function MapaInteractivo({ mapa, pins }: { mapa: Mapa; pins: Pin[] }) {
  const [activePin, setActivePin]       = useState<Pin | null>(null)
  const [previewPin, setPreviewPin]     = useState<Pin | null>(null)
  const [hoveredId, setHoveredId]       = useState<string | null>(null)
  const [bursts, setBursts]             = useState<Burst[]>([])
  const [nearestId, setNearestId]       = useState<string | null>(null)
  const [locating, setLocating]         = useState(false)
  const [geoToast, setGeoToast]         = useState('')
  const [selectedMats, setSelectedMats] = useState<string[]>([])
  const [imgIdx, setImgIdx]             = useState(0)
  const touchStartX                     = useRef(0)
  const isTouchRef                      = useRef(false)
  const containerRef                    = useRef<HTMLDivElement>(null)

  useEffect(() => setImgIdx(0), [activePin?._id])

  const pinsConCoordenadas = pins.filter(p => p.lat != null && p.lng != null)

  /* Materiales disponibles en este mapa (ordenados según MATERIALES_OPTS) */
  const allMatKeys = Array.from(new Set(pins.flatMap(p => p.materiales ?? [])))
  const materialesDisponibles = [
    ...MATERIALES_OPTS.filter(o => allMatKeys.includes(o.key)),
    ...allMatKeys.filter(k => !MATERIALES_OPTS.find(o => o.key === k)).map(k => ({ key: k, emoji: '♻️', label: k })),
  ]

  function toggleMat(key: string) {
    setSelectedMats(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }
  function pinMatchesFiltro(pin: Pin) {
    if (selectedMats.length === 0) return true
    return selectedMats.some(m => pin.materiales?.includes(m))
  }

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

      {/* Filtro por material */}
      {materialesDisponibles.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setSelectedMats([])}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              selectedMats.length === 0
                ? 'bg-[#4caf50]/20 border-[#4caf50]/50 text-white'
                : 'bg-transparent border-white/15 text-white/40 hover:border-white/30 hover:text-white/70'
            }`}
          >
            Todos
          </button>
          {materialesDisponibles.map(m => (
            <button
              key={m.key}
              onClick={() => toggleMat(m.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selectedMats.includes(m.key)
                  ? 'bg-[#4caf50]/20 border-[#4caf50]/50 text-white'
                  : 'bg-transparent border-white/15 text-white/40 hover:border-white/30 hover:text-white/70'
              }`}
            >
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card imagen */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl border border-white/6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] card-glow bg-[#071410]"
      >
        {/* Esquinas decorativas */}
        {['top-0 left-0 border-t border-l rounded-tl-2xl','top-0 right-0 border-t border-r rounded-tr-2xl','bottom-0 left-0 border-b border-l rounded-bl-2xl','bottom-0 right-0 border-b border-r rounded-br-2xl'].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 ${cls} border-[#4caf50]/25 z-10 pointer-events-none`} />
        ))}

        {/* Wrapper imagen — overflow-hidden aquí para que las cards no se corten */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={mapa.imageUrl}
            alt={mapa.nombre}
            className="w-full block map-breath"
            style={{
              transition: 'transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94)',
              transform: hovPin ? 'scale(1.07)' : 'scale(1)',
              transformOrigin: hovPin ? `${hovPin.x}% ${hovPin.y}%` : 'center',
            }}
          />
          {/* Spotlight: oscurece el fondo lejos del pin hover */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transition: 'opacity 0.5s ease',
              opacity: hovPin ? 1 : 0,
              background: hovPin
                ? `radial-gradient(circle 28% at ${hovPin.x}% ${hovPin.y}%, transparent 0%, rgba(0,0,0,0.38) 100%)`
                : 'none',
            }}
          />
        </div>

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
          const matches   = pinMatchesFiltro(pin)
          const pal = PIN_PALETTE[pin.color ?? 'green']
          const validImages = (pin.imagenes ?? []).filter(Boolean)
          const density = getDensity(pin, pins)
          const rippleDur = density >= 3 ? '1.1s' : density === 2 ? '1.5s' : density === 1 ? '2s' : '2.8s'
          return (
            <button
              key={pin._id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none pin-appear transition-opacity duration-300 ${isHovered ? 'z-40' : 'z-20'}`}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                animationDelay: `${idx * 0.08}s`,
                opacity: matches ? 1 : 0.12,
              }}
              onTouchStart={() => { isTouchRef.current = true }}
              onClick={() => {
                triggerBurst(pin)
                if (isTouchRef.current) {
                  isTouchRef.current = false
                  setPreviewPin(previewPin?._id === pin._id ? null : pin)
                } else {
                  setActivePin(isActive ? null : pin)
                }
              }}
              onMouseEnter={() => setHoveredId(pin._id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={pin.titulo}
            >
              {/* Ondas múltiples */}
              {!isActive && (
                <>
                  <span className="ripple1 absolute left-1/2 top-1/2 w-5 h-5 rounded-full pointer-events-none" style={{ background: `${pal.ripple}55`, animationDuration: rippleDur }} />
                  <span className="ripple2 absolute left-1/2 top-1/2 w-5 h-5 rounded-full pointer-events-none" style={{ background: `${pal.ripple}40`, animationDuration: rippleDur }} />
                  <span className="ripple3 absolute left-1/2 top-1/2 w-5 h-5 rounded-full pointer-events-none" style={{ background: `${pal.ripple}25`, animationDuration: rippleDur }} />
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

              {/* Preview hover rico — posición inteligente según ubicación del pin */}
              {!isActive && (() => {
                const showBelow  = pin.y < 35
                const alignLeft  = pin.x < 22
                const alignRight = pin.x > 78
                const vCls = showBelow  ? 'top-full mt-3'   : 'bottom-full mb-3'
                const hCls = alignLeft  ? 'left-0'
                           : alignRight ? 'right-0'
                           : 'left-1/2 -translate-x-1/2'
                return (
                <div className={`hidden group-hover:flex absolute ${vCls} ${hCls} flex-col pointer-events-none z-30 w-64`}
                  style={{ flexDirection: showBelow ? 'column-reverse' : 'column' }}>

                  {/* Triángulo */}
                  <div
                    className={`w-3 h-3 rotate-45 self-center flex-shrink-0 ${showBelow ? '-mb-[7px] order-first' : '-mt-[7px]'}`}
                    style={{ background: 'linear-gradient(135deg,#0f2e1a,#071b10)', border: `1px solid ${pal.stroke}30` }}
                  />

                  {/* Card */}
                  <div className="rounded-2xl overflow-hidden w-full text-left"
                    style={{ background:'linear-gradient(145deg,#0f2e1a 0%,#071b10 100%)', boxShadow:`0 16px 56px rgba(0,0,0,0.92),0 0 0 1px ${pal.stroke}28,0 0 40px ${pal.stroke}10` }}>

                    {/* Línea de acento superior */}
                    <div className="h-[2px]" style={{ background:`linear-gradient(90deg,transparent,${pal.stroke},transparent)` }} />

                    {/* Imagen con gradiente sobre ella */}
                    {validImages[0] && (
                      <div className="relative w-full h-32 overflow-hidden">
                        <img src={validImages[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display='none' }} />
                        <div className="absolute inset-0" style={{ background:'linear-gradient(to top,rgba(7,27,16,0.92) 0%,rgba(7,27,16,0.2) 55%,transparent 100%)' }} />
                        <div className="absolute bottom-2.5 left-3 right-3">
                          <p className="text-white text-xs font-bold leading-snug drop-shadow-lg">{pin.titulo}</p>
                        </div>
                      </div>
                    )}

                    <div className="p-3">
                      {/* Título (solo si no hay imagen) */}
                      {!validImages[0] && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${pal.stroke}20`, border:`1px solid ${pal.stroke}30` }}>
                            <svg viewBox="0 0 24 24" fill={pal.stroke} className="w-3.5 h-3.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/></svg>
                          </div>
                          <p className="text-white text-xs font-bold leading-snug">{pin.titulo}</p>
                        </div>
                      )}

                      {pin.descripcion && (
                        <p className="text-white/55 text-[11px] leading-relaxed line-clamp-2 mb-2">{pin.descripcion}</p>
                      )}

                      {pin.materiales && pin.materiales.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {pin.materiales.slice(0, 3).map(mat => {
                            const opt = MATERIALES_OPTS.find(o => o.key === mat)
                            return (
                              <span key={mat} className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{ background:`${pal.stroke}18`, color:pal.stroke, border:`1px solid ${pal.stroke}28` }}>
                                {opt ? `${opt.emoji} ${opt.label}` : mat}
                              </span>
                            )
                          })}
                          {pin.materiales.length > 3 && <span className="text-[10px] text-white/30 self-center">+{pin.materiales.length - 3}</span>}
                        </div>
                      )}

                      {/* Íconos de contenido */}
                      {(validImages.length > 1 || pin.videoUrl || pin.audioUrl || pin.direccion) && (
                        <div className="flex items-center gap-3 mb-2.5 pb-2.5" style={{ borderBottom:`1px solid ${pal.stroke}12` }}>
                          {validImages.length > 1 && <span className="text-[10px] text-white/35">📸 {validImages.length}</span>}
                          {pin.videoUrl && <span className="text-[10px] text-white/35">▶ Video</span>}
                          {pin.audioUrl && <span className="text-[10px] text-white/35">🎵 Audio</span>}
                          {pin.direccion && <span className="text-[10px] text-white/35">📍 Mapa</span>}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="py-2 rounded-xl text-center text-[10px] font-bold tracking-widest uppercase"
                        style={{ background:`${pal.stroke}18`, color:pal.stroke, border:`1px solid ${pal.stroke}35` }}>
                        Presioná para más info
                      </div>
                    </div>
                  </div>
                </div>
                )
              })()}
            </button>
          )
        })}
      </div>

      {/* Preview popup — mobile tap */}
      {previewPin && (() => {
        const pal = PIN_PALETTE[previewPin.color ?? 'green']
        const validImages = (previewPin.imagenes ?? []).filter(Boolean)
        return (
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
            onClick={() => setPreviewPin(null)}
          >
            <div
              className="bg-[#0d2318]/97 backdrop-blur-xl border border-[#4caf50]/20 rounded-2xl w-full max-w-sm shadow-[0_0_60px_rgba(76,175,80,0.12)] overflow-hidden"
              style={{ boxShadow: `0 0 40px rgba(76,175,80,0.08), 0 -4px 30px rgba(0,0,0,0.6)` }}
              onClick={e => e.stopPropagation()}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-[#4caf50]/40 to-transparent" />
              {validImages[0] && (
                <div className="w-full h-44 overflow-hidden">
                  <img src={validImages[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pal.stroke }} />
                    <h4 className="text-white font-bold text-base leading-tight">{previewPin.titulo}</h4>
                  </div>
                  <button
                    onClick={() => setPreviewPin(null)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors flex-shrink-0 text-sm"
                  >✕</button>
                </div>
                {previewPin.descripcion && (
                  <p className="text-white/60 text-sm leading-relaxed mb-3 line-clamp-3">{previewPin.descripcion}</p>
                )}
                {previewPin.materiales && previewPin.materiales.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {previewPin.materiales.slice(0, 5).map(mat => {
                      const opt = MATERIALES_OPTS.find(o => o.key === mat)
                      return (
                        <span key={mat} className="text-xs bg-[#4caf50]/15 border border-[#4caf50]/20 text-white/75 px-2 py-0.5 rounded-full">
                          {opt ? `${opt.emoji} ${opt.label}` : mat}
                        </span>
                      )
                    })}
                    {previewPin.materiales.length > 5 && (
                      <span className="text-xs text-white/35">+{previewPin.materiales.length - 5}</span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => { setPreviewPin(null); setActivePin(previewPin) }}
                  className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all active:scale-95"
                  style={{ background: `${pal.stroke}25`, color: pal.stroke, border: `1px solid ${pal.stroke}40` }}
                >
                  Ver más información
                </button>
              </div>
            </div>
          </div>
        )
      })()}

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
              {(() => {
                const modalImages = (activePin.imagenes ?? []).filter(Boolean)
                if (modalImages.length === 0) return null
                return (
                  <div className="relative rounded-xl overflow-hidden bg-[#071410] border border-white/8 select-none"
                    onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
                    onTouchEnd={e => {
                      const diff = touchStartX.current - e.changedTouches[0].clientX
                      if (Math.abs(diff) > 40) setImgIdx(i => diff > 0 ? (i+1)%modalImages.length : (i-1+modalImages.length)%modalImages.length)
                    }}
                  >
                    <img src={modalImages[imgIdx]} alt="" className="w-full h-52 object-cover" />
                    {modalImages.length > 1 && (
                      <>
                        <button onClick={() => setImgIdx(i => (i-1+modalImages.length)%modalImages.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-lg flex items-center justify-center transition-colors">‹</button>
                        <button onClick={() => setImgIdx(i => (i+1)%modalImages.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white text-lg flex items-center justify-center transition-colors">›</button>
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {modalImages.map((_, i) => (
                            <button key={i} onClick={() => setImgIdx(i)}
                              className={`rounded-full transition-all duration-200 ${i===imgIdx ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`} />
                          ))}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/55 rounded-full px-2 py-0.5 text-white/65 text-[10px]">{imgIdx+1}/{modalImages.length}</div>
                      </>
                    )}
                  </div>
                )
              })()}
              {activePin.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-white/8">
                  {isYoutube(activePin.videoUrl)
                    ? <iframe src={getEmbedUrl(activePin.videoUrl)} className="w-full aspect-video" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    : <video src={activePin.videoUrl} controls className="w-full" />
                  }
                </div>
              )}
              {activePin.audioUrl && (
                <div className="bg-[#0a1f12]/80 border border-[#4caf50]/20 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4caf50]/12 border border-[#4caf50]/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="#4caf50" className="w-4 h-4">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">Audio</p>
                    <audio controls src={activePin.audioUrl} className="w-full h-8" style={{ accentColor: '#4caf50' }} />
                  </div>
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
