'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CarouselSection from '@/components/admin/CarouselSection'
import MapasSection from '@/components/admin/MapasSection'
import PinsEditor from '@/components/admin/PinsEditor'

type Tab = 'carousel' | 'mapas' | 'pins'

const tabs: { key: Tab; label: string }[] = [
  { key: 'carousel', label: 'Carousel' },
  { key: 'mapas',    label: 'Mapas' },
  { key: 'pins',     label: 'Editor de Pins' },
]

export default function AdminPage() {
  const [adminPin, setAdminPin] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('carousel')
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('adminPin')
    if (!stored) {
      router.replace('/admin/login')
    } else {
      setAdminPin(stored)
    }
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem('adminPin')
    router.replace('/admin/login')
  }

  if (!adminPin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#4caf50] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a3a2a]">
      {/* Header */}
      <header className="bg-[#122a1e] border-b border-[#4caf50]/20 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 8-8 8-.5-2-1-4-5-3z"/>
            </svg>
            <span className="text-white font-semibold text-sm">Panel Admin</span>
            <span className="text-white/30 text-sm hidden sm:inline">— Puntos Verdes Laboulaye</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs text-white/40 hover:text-white transition-colors"
              target="_blank"
            >
              Ver sitio ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/70 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#122a1e] p-1 rounded-xl border border-[#4caf50]/20 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-fit py-2 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                tab === t.key
                  ? 'bg-[#4caf50] text-white shadow'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="bg-[#1e3529] rounded-2xl border border-[#4caf50]/10 p-5 md:p-6">
          {tab === 'carousel' && <CarouselSection adminPin={adminPin} />}
          {tab === 'mapas'    && <MapasSection    adminPin={adminPin} />}
          {tab === 'pins'     && <PinsEditor       adminPin={adminPin} />}
        </div>
      </div>
    </div>
  )
}
