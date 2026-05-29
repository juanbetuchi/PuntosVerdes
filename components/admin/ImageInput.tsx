'use client'
import { useRef, useState } from 'react'

function compressImage(file: File, maxWidth = 960, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.onload = e => {
      const img = new Image()
      img.onerror = () => reject(new Error('No se pudo decodificar la imagen'))
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

const inputClass = 'w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]'

export default function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [mode, setMode]         = useState<'url' | 'file'>('url')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileRef                 = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setProcessing(true)
    try {
      const compressed = await compressImage(file)
      onChange(compressed)
    } catch {
      // imagen corrupta o no soportada — simplemente no procesar
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-2">
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
