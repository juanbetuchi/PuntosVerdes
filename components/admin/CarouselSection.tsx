'use client'
import { useEffect, useState } from 'react'
import Toast from '../Toast'

interface MediaItem {
  _id: string
  type: 'video' | 'image'
  url: string
  orden: number
}

interface Props { adminPin: string }

export default function CarouselSection({ adminPin }: Props) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [form, setForm] = useState({ url: '', type: 'image' as 'image' | 'video' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const headers = { 'Content-Type': 'application/json', 'x-admin-pin': adminPin }

  async function load() {
    const data = await fetch('/api/media').then(r => r.json())
    setItems(data)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.url.trim()) return
    setLoading(true)
    await fetch('/api/media', { method: 'POST', headers, body: JSON.stringify(form) })
    setForm({ url: '', type: 'image' })
    await load()
    setLoading(false)
    setToast('Elemento agregado')
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este elemento?')) return
    await fetch(`/api/media/${id}`, { method: 'DELETE', headers })
    await load()
    setToast('Elemento eliminado')
  }

  async function handleMove(index: number, dir: -1 | 1) {
    const target = items[index + dir]
    const current = items[index]
    if (!target) return
    await Promise.all([
      fetch(`/api/media/${current._id}`, { method: 'PUT', headers, body: JSON.stringify({ orden: target.orden }) }),
      fetch(`/api/media/${target._id}`,  { method: 'PUT', headers, body: JSON.stringify({ orden: current.orden }) }),
    ])
    await load()
    setToast('Orden actualizado')
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#4caf50] mb-4">Carousel</h2>

      {items.length === 0 && (
        <p className="text-white/40 text-sm mb-4">Sin elementos. Agregá el primero abajo.</p>
      )}

      <div className="space-y-2 mb-6">
        {items.map((item, i) => (
          <div
            key={item._id}
            className="flex items-center gap-3 bg-[#243d2e] rounded-lg p-3 border border-[#4caf50]/10"
          >
            {/* Preview */}
            <div className="w-20 h-14 flex-shrink-0 rounded overflow-hidden bg-[#1a3a2a]">
              {item.type === 'image' ? (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#4caf50]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs bg-[#4caf50]/20 text-[#4caf50] px-2 py-0.5 rounded mb-1">
                {item.type}
              </span>
              <p className="text-white/70 text-xs truncate">{item.url}</p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleMove(i, -1)}
                disabled={i === 0}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
                title="Subir"
              >▲</button>
              <button
                onClick={() => handleMove(i, 1)}
                disabled={i === items.length - 1}
                className="p-1.5 rounded hover:bg-white/10 disabled:opacity-20 text-white transition-colors"
                title="Bajar"
              >▼</button>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors ml-1"
                title="Eliminar"
              >✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Formulario agregar */}
      <form onSubmit={handleAdd} className="bg-[#243d2e] rounded-xl p-4 border border-[#4caf50]/20">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Agregar elemento</h3>
        <div className="flex gap-2 mb-3">
          <label className={`flex items-center gap-1.5 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.type === 'image' ? 'border-[#4caf50] text-[#4caf50]' : 'border-white/20 text-white/50'}`}>
            <input type="radio" name="type" value="image" checked={form.type === 'image'} onChange={() => setForm(f => ({ ...f, type: 'image' }))} className="hidden" />
            Imagen
          </label>
          <label className={`flex items-center gap-1.5 cursor-pointer text-sm px-3 py-1.5 rounded-lg border transition-colors ${form.type === 'video' ? 'border-[#4caf50] text-[#4caf50]' : 'border-white/20 text-white/50'}`}>
            <input type="radio" name="type" value="video" checked={form.type === 'video'} onChange={() => setForm(f => ({ ...f, type: 'video' }))} className="hidden" />
            Video
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="URL de imagen o video..."
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            className="flex-1 bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#4caf50] hover:bg-[#43a047] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Agregar'}
          </button>
        </div>
      </form>

      <Toast message={toast} visible={!!toast} onHide={() => setToast('')} />
    </div>
  )
}
