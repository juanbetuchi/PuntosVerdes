'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [pin, setPin]       = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('adminPin')
    if (stored) router.replace('/admin')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (res.ok) {
        sessionStorage.setItem('adminPin', pin)
        router.replace('/admin')
      } else {
        setError('PIN incorrecto. Intentá de nuevo.')
        setPin('')
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a3a2a] p-4">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg className="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="#4caf50">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
          </svg>
          <h1 className="text-xl font-bold text-white">Panel Admin</h1>
          <p className="text-white/40 text-sm mt-1">Puntos Verdes — Laboulaye</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#243d2e] rounded-2xl p-6 border border-[#4caf50]/20 shadow-xl">
          <label className="block text-white/70 text-sm mb-2">PIN de acceso</label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full bg-[#1a3a2a] border border-[#4caf50]/20 rounded-xl px-4 py-3 text-white text-center text-xl tracking-widest placeholder-white/20 focus:outline-none focus:border-[#4caf50] mb-4"
            autoFocus
            required
          />

          {error && (
            <p className="text-red-400 text-sm text-center mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full py-3 bg-[#4caf50] hover:bg-[#43a047] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
