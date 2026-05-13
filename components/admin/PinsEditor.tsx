'use client'
import { useEffect, useRef, useState } from 'react'
import Toast from '../Toast'

interface Mapa { _id: string; nombre: string; imageUrl: string }
interface Pin {
  _id: string; mapaId: string
  x: number; y: number
  titulo: string; descripcion: string
  imagenes: string[]; videoUrl: string
  direccion: string
}

const emptyForm = { titulo: '', descripcion: '', imagenes: ['', '', ''], videoUrl: '', direccion: '' }

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
    const res = await fetch('/api/pins', {
      method: 'POST', headers,
      body: JSON.stringify({
        mapaId: selectedId, x: newCoords.x, y: newCoords.y,
        titulo: form.titulo, descripcion: form.descripcion,
        imagenes: form.imagenes.filter(Boolean), videoUrl: form.videoUrl,
        direccion: form.direccion,
      }),
    })
    if (res.ok) {
      const pin = await res.json()
      setPins(p => [...p, pin])
      setNewCoords(null)
      setToast('Pin creado')
    }
    setSaving(false)
  }

  function openEdit(pin: Pin) {
    setEditingPin(pin)
    setEditForm({
      titulo: pin.titulo,
      descripcion: pin.descripcion,
      imagenes: [...pin.imagenes, '', '', ''].slice(0, 3),
      videoUrl: pin.videoUrl,
      direccion: pin.direccion ?? '',
    })
    setNewCoords(null)
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingPin || !editForm.titulo.trim()) return
    setSaving(true)
    const res = await fetch(`/api/pins/${editingPin._id}`, {
      method: 'PUT', headers,
      body: JSON.stringify({
        titulo: editForm.titulo,
        descripcion: editForm.descripcion,
        imagenes: editForm.imagenes.filter(Boolean),
        videoUrl: editForm.videoUrl,
        direccion: editForm.direccion,
      }),
    })
    if (res.ok) {
      const u = await res.json()
      setPins(p => p.map(x => x._id === u._id ? u : x))
      setEditingPin(null)
      setToast('Pin guardado')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este pin?')) return
    await fetch(`/api/pins/${id}`, { method: 'DELETE', headers })
    setPins(p => p.filter(x => x._id !== id))
    if (editingPin?._id === id) setEditingPin(null)
    setToast('Pin eliminado')
  }

  const selectedMapa = mapas.find(m => m._id === selectedId)
  const inputClass   = 'w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]'

  function PinForm({ values, onChange, onSubmit, onCancel, title }: {
    values: typeof emptyForm; onChange: (v: typeof emptyForm) => void
    onSubmit: (e: React.FormEvent) => void; onCancel: () => void; title: string
  }) {
    return (
      <form onSubmit={onSubmit} className="mt-4 bg-[#243d2e] rounded-xl p-4 border border-[#4caf50]/30 space-y-2.5">
        <h4 className="text-sm font-semibold text-[#4caf50]">{title}</h4>
        <input type="text" placeholder="Título *" value={values.titulo} onChange={e => onChange({ ...values, titulo: e.target.value })} className={inputClass} required autoFocus />
        <textarea placeholder="Descripción (opcional)" value={values.descripcion} onChange={e => onChange({ ...values, descripcion: e.target.value })} className={`${inputClass} resize-none h-16`} />
        <input type="text" placeholder="Dirección (para mini-mapa, ej: Av. San Martín 123 Laboulaye)" value={values.direccion} onChange={e => onChange({ ...values, direccion: e.target.value })} className={inputClass} />
        {[0,1,2].map(i => (
          <input key={i} type="url" placeholder={`URL imagen ${i+1} (opcional)`} value={values.imagenes[i]}
            onChange={e => { const imgs = [...values.imagenes]; imgs[i] = e.target.value; onChange({ ...values, imagenes: imgs }) }}
            className={inputClass} />
        ))}
        <input type="url" placeholder="URL video (YouTube o directo, opcional)" value={values.videoUrl} onChange={e => onChange({ ...values, videoUrl: e.target.value })} className={inputClass} />
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#4caf50] hover:bg-[#43a047] text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar pin'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded-lg">Cancelar</button>
        </div>
      </form>
    )
  }

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
            return (
              <div
                key={pin._id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onMouseDown={e => startDrag(e, pin)}
                onTouchStart={e => startDrag(e, pin)}
              >
                {!isDragging && <span className="absolute inset-0 rounded-full bg-[#4caf50]/30 animate-ping scale-150 pointer-events-none" />}
                <div className={`
                  w-6 h-6 rounded-full border-2 shadow-lg transition-all duration-100
                  ${isDragging  ? 'scale-150 bg-yellow-400 border-yellow-200 shadow-yellow-400/50 cursor-grabbing'
                    : isEditing ? 'scale-130 bg-amber-400 border-white cursor-grab'
                    : editMode  ? 'bg-[#4caf50] border-white cursor-grab hover:scale-125'
                    : 'bg-[#4caf50] border-white'}
                `} />
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
            title={`Nuevo pin (${newCoords.x.toFixed(1)}%, ${newCoords.y.toFixed(1)}%)`} />
        )}
        {editingPin && (
          <PinForm values={editForm} onChange={setEditForm} onSubmit={handleSaveEdit} onCancel={() => setEditingPin(null)}
            title={`Editar: ${editingPin.titulo}`} />
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
