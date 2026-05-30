'use client'
import { useEffect, useRef, useState } from 'react'
import Toast from '../Toast'
import ImageInput from './ImageInput'
import AudioInput from './AudioInput'

interface Mapa { _id: string; nombre: string; imageUrl: string }
interface Pin {
  _id: string; mapaId: string
  x: number; y: number
  titulo: string; descripcion: string
  imagenes: string[]; videoUrl: string; audioUrl: string
  direccion: string; color: PinColor
  materiales: string[]; lat: number | null; lng: number | null
}

type PinColor = 'green' | 'yellow' | 'red' | 'blue'

const emptyForm = {
  titulo: '', descripcion: '', imagenes: ['', '', ''], videoUrl: '', audioUrl: '',
  direccion: '', color: 'green' as PinColor,
  materiales: [] as string[], lat: '', lng: '',
}

const PIN_COLORS: { value: PinColor; label: string; bg: string; border: string; dot: string }[] = [
  { value: 'green',  label: 'Punto activo',    bg: 'bg-[#4caf50]/15',  border: 'border-[#4caf50]',  dot: '#4caf50' },
  { value: 'yellow', label: 'En proceso',      bg: 'bg-yellow-400/15', border: 'border-yellow-400', dot: '#facc15' },
  { value: 'red',    label: 'Falta cobertura', bg: 'bg-red-500/15',    border: 'border-red-400',    dot: '#f87171' },
  { value: 'blue',   label: 'Informativo',     bg: 'bg-blue-400/15',   border: 'border-blue-400',   dot: '#60a5fa' },
]

export const MATERIALES_OPTS = [
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

const inputClass = 'w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]'

function PinForm({ values, onChange, onSubmit, onCancel, title, saving }: {
  values: typeof emptyForm; onChange: (v: typeof emptyForm) => void
  onSubmit: (e: React.FormEvent) => void; onCancel: () => void; title: string; saving: boolean
}) {
  const [customMat, setCustomMat] = useState('')

  function addCustomMat() {
    const mat = customMat.trim()
    if (!mat || values.materiales.includes(mat)) { setCustomMat(''); return }
    onChange({ ...values, materiales: [...values.materiales, mat] })
    setCustomMat('')
  }

  const customMats = values.materiales.filter(m => !MATERIALES_OPTS.find(o => o.key === m))

  return (
    <form onSubmit={onSubmit} className="mt-4 bg-[#243d2e] rounded-xl p-4 border border-[#4caf50]/30 space-y-2.5">
      <h4 className="text-sm font-semibold text-[#4caf50]">{title}</h4>
      <input type="text" placeholder="Título *" value={values.titulo} onChange={e => onChange({ ...values, titulo: e.target.value })} className={inputClass} required autoFocus />
      <textarea placeholder="Descripción (opcional)" value={values.descripcion} onChange={e => onChange({ ...values, descripcion: e.target.value })} className={`${inputClass} resize-none h-16`} />
      <input type="text" placeholder="Dirección (para mini-mapa, ej: Av. San Martín 123 Laboulaye)" value={values.direccion} onChange={e => onChange({ ...values, direccion: e.target.value })} className={inputClass} />

      {/* Color del pin */}
      <div>
        <p className="text-white/40 text-xs mb-2">Color del pin</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PIN_COLORS.map(c => (
            <button key={c.value} type="button" onClick={() => onChange({ ...values, color: c.value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                values.color === c.value ? `${c.bg} ${c.border} text-white` : 'bg-transparent border-white/10 text-white/40 hover:border-white/25'
              }`}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materiales aceptados */}
      <div>
        <p className="text-white/40 text-xs mb-2">Materiales que acepta</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {MATERIALES_OPTS.map(m => {
            const sel = values.materiales.includes(m.key)
            return (
              <button key={m.key} type="button"
                onClick={() => onChange({ ...values, materiales: sel ? values.materiales.filter(x => x !== m.key) : [...values.materiales, m.key] })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all border ${
                  sel ? 'bg-[#4caf50]/20 border-[#4caf50]/50 text-white' : 'bg-transparent border-white/10 text-white/30 hover:border-white/25 hover:text-white/60'
                }`}
              >
                <span>{m.emoji}</span><span>{m.label}</span>
              </button>
            )
          })}
        </div>
        {customMats.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {customMats.map(m => (
              <span key={m} className="flex items-center gap-1 bg-[#4caf50]/10 border border-[#4caf50]/25 text-white/70 text-xs px-2 py-0.5 rounded-full">
                {m}
                <button type="button" onClick={() => onChange({ ...values, materiales: values.materiales.filter(x => x !== m) })} className="text-white/40 hover:text-white ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input type="text" placeholder="Otro material..." value={customMat}
            onChange={e => setCustomMat(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomMat() } }}
            className={`${inputClass} flex-1`}
          />
          <button type="button" onClick={addCustomMat} className="px-3 py-2 bg-[#4caf50]/15 border border-[#4caf50]/25 text-[#4caf50] rounded-lg hover:bg-[#4caf50]/25 transition-colors">+</button>
        </div>
      </div>

      {/* Coordenadas GPS */}
      <div>
        <p className="text-white/40 text-xs mb-1.5">
          Coordenadas GPS <span className="text-white/20">(para "punto más cercano" — buscalas en Google Maps)</span>
        </p>
        <div className="flex gap-2">
          <input type="number" step="any" placeholder="Latitud  ej: -34.149" value={values.lat} onChange={e => onChange({ ...values, lat: e.target.value })} className={`${inputClass} flex-1`} />
          <input type="number" step="any" placeholder="Longitud  ej: -63.388" value={values.lng} onChange={e => onChange({ ...values, lng: e.target.value })} className={`${inputClass} flex-1`} />
        </div>
      </div>

      {[0,1,2].map(i => (
        <div key={i}>
          <p className="text-white/40 text-xs mb-1">Imagen {i+1} (opcional)</p>
          <ImageInput value={values.imagenes[i]} onChange={v => { const imgs = [...values.imagenes]; imgs[i] = v; onChange({ ...values, imagenes: imgs }) }} />
        </div>
      ))}
      <input type="url" placeholder="URL video (YouTube o directo, opcional)" value={values.videoUrl} onChange={e => onChange({ ...values, videoUrl: e.target.value })} className={inputClass} />
      <div>
        <p className="text-white/40 text-xs mb-1">Audio (opcional)</p>
        <AudioInput value={values.audioUrl} onChange={v => onChange({ ...values, audioUrl: v })} />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#4caf50] hover:bg-[#43a047] text-white text-sm font-medium rounded-lg disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar pin'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg">Cancelar</button>
      </div>
    </form>
  )
}

interface Props { adminPin: string }

export default function PinsEditor({ adminPin }: Props) {
  const [mapas, setMapas]           = useState<Mapa[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [pins, setPins]             = useState<Pin[]>([])
  const [editMode, setEditMode]     = useState(false)
  const [newCoords, setNewCoords]   = useState<{ x: number; y: number } | null>(null)
  const [form, setForm]             = useState(emptyForm)
  const [editingPin, setEditingPin] = useState<Pin | null>(null)
  const [editForm, setEditForm]     = useState(emptyForm)
  const [saving, setSaving]         = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [toast, setToast]           = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const editModeRef  = useRef(editMode)
  useEffect(() => { editModeRef.current = editMode }, [editMode])

  const headers = { 'Content-Type': 'application/json', 'x-admin-pin': adminPin }

  useEffect(() => {
    fetch('/api/mapas').then(r => r.json()).then(setMapas)
  }, [])

  useEffect(() => {
    if (!selectedId) { setPins([]); return }
    fetch(`/api/pins?mapaId=${selectedId}`).then(r => r.json()).then(setPins)
    setNewCoords(null); setEditingPin(null); setEditMode(false)
  }, [selectedId])

  function getPct(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width)  * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top)  / rect.height) * 100)),
    }
  }

  function startDrag(e: React.MouseEvent | React.TouchEvent, pin: Pin) {
    if (!editModeRef.current) return
    e.preventDefault()
    e.stopPropagation()

    const pinId = pin._id
    let hasMoved = false
    let lastX    = pin.x
    let lastY    = pin.y

    setDraggingId(pinId)
    setNewCoords(null)

    function clientOf(ev: MouseEvent | TouchEvent) {
      if ('touches' in ev && ev.touches.length > 0)
        return { cx: ev.touches[0].clientX, cy: ev.touches[0].clientY }
      if ('changedTouches' in ev && ev.changedTouches.length > 0)
        return { cx: ev.changedTouches[0].clientX, cy: ev.changedTouches[0].clientY }
      return { cx: (ev as MouseEvent).clientX, cy: (ev as MouseEvent).clientY }
    }

    function onMove(ev: MouseEvent | TouchEvent) {
      ev.preventDefault()
      hasMoved = true
      const { cx, cy } = clientOf(ev)
      const { x, y }   = getPct(cx, cy)
      lastX = x; lastY = y
      setPins(prev => prev.map(p => p._id === pinId ? { ...p, x, y } : p))
    }

    async function onEnd() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onEnd)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onEnd)
      setDraggingId(null)

      if (!hasMoved) {
        openEdit(pin)
        return
      }
      setPins(prev => prev.map(p => p._id === pinId ? { ...p, x: lastX, y: lastY } : p))
      await fetch(`/api/pins/${pinId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ x: lastX, y: lastY }),
      })
      setToast('Posición guardada')
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onEnd)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onEnd)
  }

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!editMode || draggingId) return
    if (editingPin) { setEditingPin(null); return }
    const { x, y } = getPct(e.clientX, e.clientY)
    setNewCoords({ x, y })
    setForm(emptyForm)
  }

  async function handleSaveNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newCoords || !form.titulo.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/pins', {
        method: 'POST', headers,
        body: JSON.stringify({
          mapaId: selectedId, x: newCoords.x, y: newCoords.y,
          titulo: form.titulo, descripcion: form.descripcion,
          imagenes: form.imagenes.filter(Boolean), videoUrl: form.videoUrl,
          audioUrl: form.audioUrl,
          direccion: form.direccion, color: form.color,
          materiales: form.materiales,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
        }),
      })
      if (res.ok) {
        const pin = await res.json()
        setPins(p => [...p, pin])
        setNewCoords(null)
        setForm(emptyForm)
        setToast('Pin creado')
      }
    } finally {
      setSaving(false)
    }
  }

  function openEdit(pin: Pin) {
    setEditingPin(pin)
    setEditForm({
      titulo: pin.titulo,
      descripcion: pin.descripcion,
      imagenes: [...pin.imagenes, '', '', ''].slice(0, 3),
      videoUrl: pin.videoUrl,
      audioUrl: pin.audioUrl ?? '',
      direccion: pin.direccion ?? '',
      color: pin.color ?? 'green',
      materiales: pin.materiales ?? [],
      lat: pin.lat != null ? String(pin.lat) : '',
      lng: pin.lng != null ? String(pin.lng) : '',
    })
    setNewCoords(null)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPin || !editForm.titulo.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/pins/${editingPin._id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({
          titulo: editForm.titulo,
          descripcion: editForm.descripcion,
          imagenes: editForm.imagenes.filter(Boolean),
          videoUrl: editForm.videoUrl,
          audioUrl: editForm.audioUrl,
          direccion: editForm.direccion,
          color: editForm.color,
          materiales: editForm.materiales,
          lat: editForm.lat ? parseFloat(editForm.lat) : null,
          lng: editForm.lng ? parseFloat(editForm.lng) : null,
        }),
      })
      if (res.ok) {
        const u = await res.json()
        setPins(p => p.map(x => x._id === u._id ? u : x))
        setEditingPin(null)
        setToast('Pin guardado')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este pin?')) return
    const res = await fetch(`/api/pins/${id}`, { method: 'DELETE', headers })
    if (!res.ok) return
    setPins(p => p.filter(x => x._id !== id))
    if (editingPin?._id === id) setEditingPin(null)
    setToast('Pin eliminado')
  }

  const selectedMapa = mapas.find(m => m._id === selectedId)

  return (
    <div>
      <h2 className="text-lg font-bold text-[#4caf50] mb-4">Editor de Pins</h2>

      <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
        className="w-full bg-[#243d2e] border border-[#4caf50]/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#4caf50] mb-4">
        <option value="">— Seleccionar mapa —</option>
        {mapas.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
      </select>

      {selectedMapa && (<>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <button
            onClick={() => { setEditMode(v => !v); setNewCoords(null); setEditingPin(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editMode ? 'bg-amber-500 hover:bg-amber-400 text-white' : 'bg-[#4caf50] hover:bg-[#43a047] text-white'}`}
          >
            {editMode ? '✏️ Edición activa' : 'Activar edición'}
          </button>
          {editMode && (
            <span className="text-white/40 text-xs">
              Click en imagen → nuevo pin · Click y arrastrá un pin → moverlo
            </span>
          )}
          <span className="ml-auto text-white/35 text-xs">{pins.length} pin{pins.length !== 1 ? 's' : ''}</span>
        </div>

        <div
          ref={containerRef}
          className={`relative w-full rounded-xl overflow-hidden border border-[#4caf50]/20 select-none touch-none ${
            draggingId ? 'cursor-grabbing' : editMode ? 'cursor-crosshair' : ''
          }`}
          onClick={handleImageClick}
        >
          <img src={selectedMapa.imageUrl} alt={selectedMapa.nombre} className="w-full block pointer-events-none" draggable={false} />

          {pins.map(pin => {
            const isDragging = draggingId === pin._id
            const isEditing  = editingPin?._id === pin._id
            const dotColor   = PIN_COLORS.find(c => c.value === pin.color)?.dot ?? '#4caf50'
            return (
              <div
                key={pin._id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onMouseDown={e => startDrag(e, pin)}
                onTouchStart={e => startDrag(e, pin)}
              >
                {!isDragging && (
                  <span className="absolute inset-0 rounded-full animate-ping scale-150 pointer-events-none"
                    style={{ backgroundColor: `${dotColor}4d` }} />
                )}
                <div
                  className={`w-6 h-6 rounded-full border-2 shadow-lg transition-all duration-100 ${
                    isDragging  ? 'scale-150 border-yellow-200 shadow-yellow-400/50 cursor-grabbing'
                    : isEditing ? 'scale-130 border-white cursor-grab'
                    : editMode  ? 'border-white cursor-grab hover:scale-125'
                    : 'border-white'
                  }`}
                  style={{ backgroundColor: isDragging ? '#facc15' : isEditing ? '#f59e0b' : dotColor }}
                />
                {isDragging && (
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-[#0d2318]/95 border border-yellow-400/50 rounded-lg px-2.5 py-1 text-yellow-300 text-[10px] whitespace-nowrap pointer-events-none shadow-xl">
                    {pin.titulo}
                  </div>
                )}
              </div>
            )
          })}

          {newCoords && (
            <div className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ left: `${newCoords.x}%`, top: `${newCoords.y}%` }}>
              <div className="w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </div>
          )}
        </div>

        {newCoords && !editingPin && (
          <PinForm values={form} onChange={setForm} onSubmit={handleSaveNew} onCancel={() => setNewCoords(null)}
            title={`Nuevo pin (${newCoords.x.toFixed(1)}%, ${newCoords.y.toFixed(1)}%)`} saving={saving} />
        )}
        {editingPin && (
          <PinForm values={editForm} onChange={setEditForm} onSubmit={handleSaveEdit} onCancel={() => setEditingPin(null)}
            title={`Editar: ${editingPin.titulo}`} saving={saving} />
        )}

        {pins.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-white/50 mb-2">Pins en este mapa</h3>
            <div className="space-y-1.5">
              {pins.map(pin => (
                <div key={pin._id}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                    editingPin?._id === pin._id ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#243d2e] border-[#4caf50]/10'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-white text-sm font-medium">{pin.titulo}</span>
                    <span className="text-white/25 text-xs ml-2">{pin.x.toFixed(1)}% · {pin.y.toFixed(1)}%</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(pin)} className="px-2.5 py-1 text-xs bg-[#4caf50]/15 hover:bg-[#4caf50]/25 text-[#4caf50] rounded-md">Editar</button>
                    <button onClick={() => handleDelete(pin._id)} className="px-2.5 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md">Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>)}

      <Toast message={toast} visible={!!toast} onHide={() => setToast('')} />
    </div>
  )
}
