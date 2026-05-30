'use client'
import { useRef, useState } from 'react'

const inputClass = 'w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#4caf50]'
const MAX_MB = 8

export default function AudioInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [mode, setMode]   = useState<'url' | 'file'>('url')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [sizeWarn, setSizeWarn] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/webm', 'video/mp4']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|mp4|ogg|wav|m4a)$/i)) {
      setSizeWarn('Formato no soportado. Usá MP3, MP4, OGG o WAV.')
      return
    }
    const mb = file.size / 1024 / 1024
    if (mb > MAX_MB) {
      setSizeWarn(`El archivo pesa ${mb.toFixed(1)} MB. Máximo ${MAX_MB} MB.`)
      return
    }
    setSizeWarn('')
    setProcessing(true)
    const reader = new FileReader()
    reader.onload = e => {
      onChange(e.target!.result as string)
      setProcessing(false)
    }
    reader.onerror = () => {
      setSizeWarn('No se pudo leer el archivo.')
      setProcessing(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      {/* Tabs */}
      <div className="flex gap-1 p-0.5 bg-[#1a3a2a] rounded-lg border border-[#4caf50]/15 w-fit">
        {(['url', 'file'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === m ? 'bg-[#4caf50]/20 text-[#4caf50] border border-[#4caf50]/30' : 'text-white/40 hover:text-white/65'
            }`}>
            {m === 'url' ? '🔗 URL' : '🎵 Subir audio'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <input type="url" placeholder="https://... URL del audio (MP3, MP4...)"
          value={value.startsWith('data:') ? '' : value}
          onChange={e => onChange(e.target.value)}
          className={inputClass} />
      ) : (
        <div
          className={`relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            dragging ? 'border-[#4caf50] bg-[#4caf50]/8' : 'border-[#4caf50]/25 hover:border-[#4caf50]/50 bg-[#1a3a2a]/60'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        >
          <input ref={fileRef} type="file" accept="audio/*,video/mp4,.mp3,.mp4,.ogg,.wav,.m4a"
            className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          <div className="py-5 flex flex-col items-center gap-2 pointer-events-none">
            {processing ? (
              <>
                <div className="w-6 h-6 border-2 border-[#4caf50] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#4caf50]/70 text-xs">Cargando audio...</p>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="1.5" className="w-8 h-8 opacity-50">
                  <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <p className="text-white/50 text-xs text-center leading-relaxed">
                  Arrastrá un audio acá<br/>
                  <span className="text-[#4caf50]/60">o hacé click para seleccionar</span>
                </p>
                <p className="text-white/20 text-[10px]">MP3, MP4, OGG, WAV — máx {MAX_MB} MB</p>
              </>
            )}
          </div>
        </div>
      )}

      {sizeWarn && <p className="text-red-400/80 text-xs px-1">{sizeWarn}</p>}

      {/* Preview player */}
      {value && (
        <div className="bg-[#1a3a2a] border border-[#4caf50]/15 rounded-lg p-3 flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="#4caf50" className="w-5 h-5 flex-shrink-0 opacity-70">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <audio controls src={value} className="flex-1 h-8 min-w-0" style={{ accentColor: '#4caf50' }} />
          <button type="button" onClick={() => onChange('')}
            className="w-6 h-6 rounded-full bg-black/40 hover:bg-red-500/60 text-white/60 hover:text-white text-xs flex items-center justify-center flex-shrink-0 transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
