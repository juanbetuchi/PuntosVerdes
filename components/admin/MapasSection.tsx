'use client'
import { useEffect, useRef, useState } from 'react'
import Toast from '../Toast'

interface Mapa {
  _id: string
  nombre: string
  descripcion: string
  imageUrl: string
  categoria: 'local' | 'provincial'
  activo: boolean
}

type EditForm = { nombre: string; descripcion: string; imageUrl: string; categoria: 'local' | 'provincial' }

const empty: EditForm = { nombre: '', descripcion: '', imageUrl: '', categoria: 'local' }

interface Props { adminPin: string }

/* ── Compresión en el cliente: convierte File a base64 JPEG ── */
function compressImage(file: File, maxWidth = 960, quality = 0.82): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

/* ── Campo de imagen: URL o subir archivo ── */
function ImageInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [mode, setMode]         = useState<'url' | 'file'>('url')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef                 = useRef<HTMLInputElement>(null)

  const inputClass = 'w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]'

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setProcessing(true)
    const compressed = await compressImage(file)
    onChange(compressed)
    setProcessing(false)
  }

  return (
    <div className="space-y-2">
      {/* Tabs URL / Archivo */}
      <div className="flex gap-1 p-0.5 bg-[#1a3a2a] rounded-lg border border-[#4caf50]/15 w-fit">
        {(['url', 'file'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === m
                ? 'bg-[#4caf50]/20 text-[#4caf50] border border-[#4caf50]/30'
                : 'text-white/40 hover:text-white/65'
            }`}
          >
            {m === 'url' ? '🔗 URL' : '📁 Subir imagen'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          placeholder="https://... URL de la imagen"
          value={value.startsWith('data:') ? '' : value}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        /* Zona de drop / clic */
        <div
          className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragging
              ? 'border-[#4caf50] bg-[#4caf50]/8'
              : 'border-[#4caf50]/25 hover:border-[#4caf50]/50 bg-[#1a3a2a]/60'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault(); setDragging(false)
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <div className="py-6 flex flex-col items-center gap-2 pointer-events-none">
            {processing ? (
              <>
                <div className="w-6 h-6 border-2 border-[#4caf50] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#4caf50]/70 text-xs">Procesando imagen...</p>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="1.5" className="w-8 h-8 opacity-50">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-white/50 text-xs text-center leading-relaxed">
                  Arrastrá una imagen acá<br />
                  <span className="text-[#4caf50]/60">o hacé click para seleccionar</span>
                </p>
                <p className="text-white/20 text-[10px]">JPG, PNG, WEBP — se comprime automáticamente</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-[#1a3a2a] border border-[#4caf50]/15">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500/70 text-white/70 hover:text-white text-xs flex items-center justify-center transition-colors"
          >✕</button>
          {value.startsWith('data:') && (
            <div className="absolute bottom-1.5 left-1.5 bg-black/60 rounded-md px-1.5 py-0.5 text-[10px] text-white/60">
              Imagen subida
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Selector de categoría ── */
function CatSelector({ value, onChange, name }: { value: 'local'|'provincial'; onChange: (v:'local'|'provincial')=>void; name: string }) {
  return (
    <div className="flex gap-2">
      {(['local', 'provincial'] as const).map(cat => (
        <label key={cat} className={`flex-1 text-center cursor-pointer text-sm px-3 py-2 rounded-lg border transition-colors ${
          value === cat ? 'border-[#4caf50] bg-[#4caf50]/10 text-[#4caf50]' : 'border-white/20 text-white/50'
        }`}>
          <input type="radio" name={name} value={cat} checked={value === cat} onChange={() => onChange(cat)} className="hidden" />
          {cat === 'local' ? 'Local' : 'Provincial'}
        </label>
      ))}
    </div>
  )
}

export default function MapasSection({ adminPin }: Props) {
  const [mapas, setMapas]         = useState<Mapa[]>([])
  const [form, setForm]           = useState(empty)
  const [loading, setLoading]     = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm]   = useState(empty)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState('')

  const headers = { 'Content-Type': 'application/json', 'x-admin-pin': adminPin }

  async function load() {
    const data = await fetch('/api/mapas').then(r => r.json())
    setMapas(data)
  }

  useEffect(() => { load() }, [])

  function openEdit(mapa: Mapa) {
    setEditingId(mapa._id)
    setEditForm({ nombre: mapa.nombre, descripcion: mapa.descripcion, imageUrl: mapa.imageUrl, categoria: mapa.categoria })
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !editForm.nombre.trim() || !editForm.imageUrl.trim()) return
    setSaving(true)
    await fetch(`/api/mapas/${editingId}`, { method: 'PUT', headers, body: JSON.stringify(editForm) })
    await load(); setSaving(false); setEditingId(null)
    setToast('Mapa actualizado')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim() || !form.imageUrl.trim()) return
    setLoading(true)
    await fetch('/api/mapas', { method: 'POST', headers, body: JSON.stringify(form) })
    setForm(empty); await load(); setLoading(false)
    setToast('Mapa creado')
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este mapa y todos sus pins?')) return
    await fetch(`/api/mapas/${id}`, { method: 'DELETE', headers })
    if (editingId === id) setEditingId(null)
    await load()
    setToast('Mapa eliminado')
  }

  async function handleToggle(mapa: Mapa) {
    await fetch(`/api/mapas/${mapa._id}`, { method: 'PUT', headers, body: JSON.stringify({ activo: !mapa.activo }) })
    await load()
    setToast(mapa.activo ? 'Mapa desactivado' : 'Mapa activado')
  }

  const inputClass = 'w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]'

  return (
    <div>
      <h2 className="text-lg font-bold text-[#4caf50] mb-4">Mapas</h2>

      {mapas.length === 0 && <p className="text-white/40 text-sm mb-4">Sin mapas. Creá el primero abajo.</p>}

      <div className="space-y-2 mb-6">
        {mapas.map(mapa => (
          <div key={mapa._id}>
            <div className={`flex items-center gap-3 rounded-lg p-3 border transition-colors ${
              editingId === mapa._id ? 'bg-amber-500/8 border-amber-500/30' : 'bg-[#243d2e] border-[#4caf50]/10'
            }`}>
              <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden bg-[#1a3a2a]">
                <img src={mapa.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{mapa.nombre}</p>
                <span className="text-xs text-white/40">{mapa.categoria === 'local' ? 'Local' : 'Provincial'}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => editingId === mapa._id ? setEditingId(null) : openEdit(mapa)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    editingId === mapa._id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-[#4caf50]/12 hover:bg-[#4caf50]/22 text-[#4caf50] border border-[#4caf50]/20'
                  }`}
                >
                  {editingId === mapa._id ? 'Cancelar' : '✏ Editar'}
                </button>
                <button
                  onClick={() => handleToggle(mapa)}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0 ${mapa.activo ? 'bg-[#4caf50]' : 'bg-white/20'}`}
                  title={mapa.activo ? 'Activo' : 'Inactivo'}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${mapa.activo ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <button onClick={() => handleDelete(mapa._id)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors" title="Eliminar">✕</button>
              </div>
            </div>

            {editingId === mapa._id && (
              <form onSubmit={handleSaveEdit} className="mt-1 bg-[#1e3529] rounded-xl p-4 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <p className="text-amber-300/70 text-xs font-semibold uppercase tracking-wider">Editando mapa</p>
                </div>
                <input type="text" placeholder="Nombre *" value={editForm.nombre} onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))} className={inputClass} required autoFocus />
                <input type="text" placeholder="Descripción (opcional)" value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} className={inputClass} />
                <ImageInput value={editForm.imageUrl} onChange={v => setEditForm(f => ({ ...f, imageUrl: v }))} />
                <CatSelector value={editForm.categoria} onChange={v => setEditForm(f => ({ ...f, categoria: v }))} name={`edit-cat-${mapa._id}`} />
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#4caf50] hover:bg-[#43a047] text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-white/8 hover:bg-white/14 text-white text-sm rounded-lg transition-colors">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* Formulario crear */}
      <form onSubmit={handleCreate} className="bg-[#243d2e] rounded-xl p-4 border border-[#4caf50]/20 space-y-3">
        <h3 className="text-sm font-semibold text-white/80">Crear mapa</h3>
        <input type="text" placeholder="Nombre del mapa *" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className={inputClass} required />
        <input type="text" placeholder="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className={inputClass} />
        <ImageInput value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />
        <CatSelector value={form.categoria} onChange={v => setForm(f => ({ ...f, categoria: v }))} name="new-categoria" />
        <button type="submit" disabled={loading} className="w-full py-2 bg-[#4caf50] hover:bg-[#43a047] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Creando...' : 'Crear mapa'}
        </button>
      </form>

      <Toast message={toast} visible={!!toast} onHide={() => setToast('')} />
    </div>
  )
}
