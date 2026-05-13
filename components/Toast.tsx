'use client'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onHide: () => void
  type?: 'success' | 'error'
}

export default function Toast({ message, visible, onHide, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onHide, 2800)
    return () => clearTimeout(t)
  }, [visible, onHide])

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
    }`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md whitespace-nowrap ${
        type === 'success'
          ? 'bg-[#0d2318]/95 border-[#4caf50]/40 text-[#a5d6a7]'
          : 'bg-[#2d0a0a]/95 border-red-500/40 text-red-300'
      }`}>
        {type === 'success'
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#4caf50] flex-shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0"><path d="M18 6L6 18M6 6l12 12"/></svg>
        }
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}
